import User from '../models/User.mjs';
import { Follow } from '../models/Follow.mjs';

export const followUser = async (req, res) => {
    const following = await User.findOne({ where: { username: req.params.username } });

    if (!following) return res.status(404).json({ message: "User not found" });

    await Follow.create({ followerId: req.user.id, followingId: following.id });

    res.io.emit("followUpdate", { follower: req.user.username, following: following.username });

    res.redirect(`/profile/${following.username}`);
};

export const unfollowUser = async (req, res) => {
    const following = await User.findOne({ where: { username: req.params.username } });
    if (!following) return res.status(404).json({ message: 'User not found' });
    
    await Follow.destroy({ where: { followerId: req.user.id, followingId: following.id } });

    res.io.emit("followUpdate", { follower: req.user.username, following: following.username });

    res.redirect(`/profile/${following.username}`);

}; 