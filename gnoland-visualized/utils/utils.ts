// Returns first and last 4 characters of address
export const formatAddress = (dir: string) => {
    return dir.replace(/(g1[a-z0-9]{10,})/g, (match) => `${match.slice(0, 4)}...${match.slice(-4)}`);
};