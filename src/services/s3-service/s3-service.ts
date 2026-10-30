import type { PostFile } from "./types";

class S3Service {
    async postFile(pl: PostFile) {
        const formData = new FormData();

        Object.entries(pl.fields).forEach(([key, value]) => {
            formData.append(key, value);
        });
        
        formData.append('file', pl.file);

        const res = await fetch(pl.url, {
            method: 'POST',
            body: formData
        });

        return res.ok;
    }

    async putFile(pl: { file: File, url: string }) {
        const res = await fetch(pl.url, {
            method: 'PUT',
            headers: { 'Content-Type': pl.file.type },
            body: pl.file
        });

        return res.ok;
    }
}

export default new S3Service;