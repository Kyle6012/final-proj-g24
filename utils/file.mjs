export const FileId = (url) => {
    const parts = url.split('_'); // Split the URL by '_'
    const fileId = parts[parts.length - 1]; // Get the last part after the last underscore
    return fileId;
};
