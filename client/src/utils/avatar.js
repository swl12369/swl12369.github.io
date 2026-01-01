import { API_URL } from '../config';

export const getAvatarUrl = (user) => {
    if (!user) return `https://api.dicebear.com/9.x/dylan/svg?seed=default`;

    // If user has uploaded avatar, use it
    if (user.avatarPath) {
        return `${API_URL}${user.avatarPath}`;
    }

    // Otherwise use generated avatar
    const seed = user.avatarSeed || user.username;
    return `https://api.dicebear.com/9.x/dylan/svg?seed=${seed}`;
};
