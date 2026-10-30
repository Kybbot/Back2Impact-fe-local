export type PostFile = {
    file: File;
    key: string;
    url: string;
    fields: {
        [key: string]: string;
    };
}