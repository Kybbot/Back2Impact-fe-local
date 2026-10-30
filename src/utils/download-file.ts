const R2_URL = import.meta.env.VITE_R2_URL;

export const downloadFile = async (name: string, key: string) => {
    const response = await fetch(`${R2_URL}/${key}`);

    if (!response.ok) throw new Error(`'Failed to download file for ${name} ${key}'`);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = name;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(blobUrl);
}