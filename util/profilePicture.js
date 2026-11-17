const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const uploadDirectory = path.resolve(__dirname, '..', 'uploads');
const maxFileSize = 2 * 1024 * 1024;
const maxRequestSize = maxFileSize + 128 * 1024;

const badRequest = (res, message) => res.status(400).json({ error: message });

// Small multipart parser for this endpoint: buffers are capped, filenames are ignored,
// and accepted image types are verified by their file signatures before storage.
const parseEmployeeUpload = (req, res, next) => {
    if (!req.is('multipart/form-data')) return next();
    req.body = {};
    const boundaryMatch = /^multipart\/form-data\s*;\s*boundary=(?:"([^"]+)"|([^;\s]+))/i.exec(req.headers['content-type'] || '');
    if (!boundaryMatch) return badRequest(res, 'Invalid multipart boundary');
    const boundary = Buffer.from(`--${boundaryMatch[1] || boundaryMatch[2]}`);
    const chunks = [];
    let total = 0;
    let finished = false;
    req.on('data', chunk => {
        if (finished) return;
        total += chunk.length;
        if (total > maxRequestSize) {
            finished = true;
            res.status(413).json({ error: 'Upload request is too large' });
            return;
        }
        chunks.push(chunk);
    });
    req.on('end', () => {
        if (finished) return;
        try {
            const body = Buffer.concat(chunks);
            let cursor = body.indexOf(boundary);
            if (cursor < 0) return badRequest(res, 'Malformed multipart request');
            cursor += boundary.length;
            while (cursor < body.length) {
                if (body.subarray(cursor, cursor + 2).toString() === '--') break;
                if (body.subarray(cursor, cursor + 2).toString() === '\r\n') cursor += 2;
                const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), cursor);
                if (headerEnd < 0) return badRequest(res, 'Malformed multipart headers');
                const headers = body.subarray(cursor, headerEnd).toString('latin1');
                const nextBoundary = body.indexOf(Buffer.concat([Buffer.from('\r\n'), boundary]), headerEnd + 4);
                if (nextBoundary < 0) return badRequest(res, 'Malformed multipart body');
                const content = body.subarray(headerEnd + 4, nextBoundary);
                const disposition = /content-disposition:\s*form-data;[^\r\n]*name="([^"]+)"(?:;\s*filename="[^"]*")?/i.exec(headers);
                if (!disposition) return badRequest(res, 'Malformed multipart field');
                const fieldName = disposition[1];
                const isFile = /;\s*filename="[^"]*"/i.test(disposition[0]);
                if (isFile) {
                    if (fieldName !== 'profile_picture') return badRequest(res, 'Unexpected file field');
                    if (req.profilePicture) return badRequest(res, 'Only one profile picture is allowed');
                    if (content.length > maxFileSize) return res.status(413).json({ error: 'Profile picture must be 2 MB or smaller' });
                    const mime = (/content-type:\s*([^\r\n]+)/i.exec(headers) || [])[1]?.trim().toLowerCase();
                    let ext;
                    if (mime === 'image/jpeg' && content.length > 3 && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff) ext = '.jpg';
                    if (mime === 'image/png' && content.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) ext = '.png';
                    if (mime === 'image/webp' && content.toString('ascii', 0, 4) === 'RIFF' && content.toString('ascii', 8, 12) === 'WEBP') ext = '.webp';
                    if (!ext) return badRequest(res, 'Only valid JPEG, PNG, or WebP images are allowed');
                    req.profilePicture = { buffer: content, ext };
                } else {
                    req.body[fieldName] = content.toString('utf8');
                }
                cursor = nextBoundary + 2 + boundary.length;
            }
            next();
        } catch (_) {
            badRequest(res, 'Malformed multipart request');
        }
    });
};

const storeProfilePicture = async picture => {
    if (!picture) return null;
    await fs.promises.mkdir(uploadDirectory, { recursive: true });
    const filename = `${crypto.randomUUID()}${picture.ext}`;
    await fs.promises.writeFile(path.join(uploadDirectory, filename), picture.buffer, { flag: 'wx', mode: 0o644 });
    return `/uploads/${filename}`;
};

const removeProfilePicture = async url => {
    if (!url || !/^\/uploads\/[a-f0-9-]+\.(?:jpg|png|webp)$/i.test(url)) return;
    const filename = path.basename(url);
    await fs.promises.unlink(path.join(uploadDirectory, filename)).catch(error => {
        if (error.code !== 'ENOENT') throw error;
    });
};

module.exports = { parseEmployeeUpload, storeProfilePicture, removeProfilePicture };
