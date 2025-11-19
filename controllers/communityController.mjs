import Community from '../models/Community.mjs';
import CommunityMember from '../models/CommunityMember.mjs';
import User from '../models/User.mjs';
import Post from '../models/Post.mjs';
import { screenText } from '../middleware/screenText.mjs';
import { v4 as uuidv4 } from 'uuid';

// Create a new community
export const createCommunity = async (req, res) => {
    try {
        // Handle both form data and JSON requests
        let data = req.body;
        
        // If content-type is application/json, the body is already parsed
        // Otherwise, we need to parse the form data
        const { name, displayName, description, rules, isPrivate } = data;
        const userId = req.user.id;

        // Validate community name (alphanumeric with underscore and dash)
        const nameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!nameRegex.test(name)) {
            return res.status(400).json({ 
                message: 'Community name can only contain letters, numbers, underscores, and dashes' 
            });
        }

        // Check if community name already exists
        const existingCommunity = await Community.findOne({ where: { name } });
        if (existingCommunity) {
            return res.status(400).json({ message: 'Community name already exists' });
        }

        // Screen content for inappropriate material
        if (description) {
            const descriptionCheck = await screenText(description);
            if (!descriptionCheck.ok) {
                return res.status(400).json({ 
                    message: 'Description contains inappropriate content',
                    reason: descriptionCheck.reason
                });
            }
        }

        if (rules) {
            const rulesCheck = await screenText(rules);
            if (!rulesCheck.ok) {
                return res.status(400).json({ 
                    message: 'Rules contain inappropriate content',
                    reason: rulesCheck.reason
                });
            }
        }

        // Create the community
        const community = await Community.create({
            id: uuidv4(),
            name,
            displayName,
            description,
            rules,
            isPrivate: isPrivate === 'true' || isPrivate === true,
            creatorId: userId
        });

        // Add creator as admin member
        await CommunityMember.create({
            userId,
            communityId: community.id,
            role: 'admin'
        });

        res.status(201).json({ 
            message: 'Community created successfully', 
            community 
        });
    } catch (error) {
        console.error('Error creating community:', error);
        res.status(500).json({ message: 'Failed to create community' });
    }
};

// Get all communities
export const getAllCommunities = async (req, res) => {
    try {
        const communities = await Community.findAll({
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'profilePic']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // If this is an API request, return JSON
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ communities });
        }

        // Otherwise render the communities page
        let user = null;
        if (req.user) {
            user = await User.findByPk(req.user.id, {
                attributes: ['id', 'username', 'fullname', 'profilePic']
            });
        }

        res.render('communities', { 
            user: user ? user.get({ plain: true }) : null,
            communities: communities.map(c => c.get({ plain: true }))
        });
    } catch (error) {
        console.error('Error fetching communities:', error);
        res.status(500).json({ message: 'Failed to fetch communities' });
    }
};

// Get a single community by name
export const getCommunity = async (req, res) => {
    try {
        const { name } = req.params;
        
        const community = await Community.findOne({ 
            where: { name },
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'username', 'profilePic']
                }
            ]
        });

        if (!community) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(404).json({ message: 'Community not found' });
            } else {
                return res.render('error', { message: 'Community not found' });
            }
        }

        // Get community posts
        const posts = await Post.findAll({
            where: { 
                communityId: community.id,
                status: 'approved'
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'profilePic']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Get member count
        const memberCount = await CommunityMember.count({
            where: { communityId: community.id }
        });

        // Check if current user is a member
        let userMembership = null;
        if (req.user) {
            userMembership = await CommunityMember.findOne({
                where: {
                    userId: req.user.id,
                    communityId: community.id
                }
            });
        }

        // If this is an API request, return JSON
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ 
                community: community.get({ plain: true }),
                posts: posts.map(p => p.get({ plain: true })),
                memberCount,
                userMembership: userMembership ? userMembership.get({ plain: true }) : null
            });
        }

        // Otherwise render the community page
        let user = null;
        if (req.user) {
            user = await User.findByPk(req.user.id, {
                attributes: ['id', 'username', 'fullname', 'profilePic']
            });
        }

        res.render('community', { 
            user: user ? user.get({ plain: true }) : null,
            community: community.get({ plain: true }),
            posts: posts.map(p => p.get({ plain: true })),
            memberCount,
            userMembership: userMembership ? userMembership.get({ plain: true }) : null
        });
    } catch (error) {
        console.error('Error fetching community:', error);
        res.status(500).json({ message: 'Failed to fetch community' });
    }
};

// Join a community
export const joinCommunity = async (req, res) => {
    try {
        const { communityId } = req.params;
        const userId = req.user.id;

        // Check if community exists
        const community = await Community.findByPk(communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        // Check if user is already a member
        const existingMembership = await CommunityMember.findOne({
            where: { userId, communityId }
        });

        if (existingMembership) {
            return res.status(400).json({ message: 'Already a member of this community' });
        }

        // Create membership
        await CommunityMember.create({
            userId,
            communityId,
            role: 'member'
        });

        res.status(200).json({ message: 'Successfully joined community' });
    } catch (error) {
        console.error('Error joining community:', error);
        res.status(500).json({ message: 'Failed to join community' });
    }
};

// Leave a community
export const leaveCommunity = async (req, res) => {
    try {
        const { communityId } = req.params;
        const userId = req.user.id;

        // Check if user is a member
        const membership = await CommunityMember.findOne({
            where: { userId, communityId }
        });

        if (!membership) {
            return res.status(400).json({ message: 'Not a member of this community' });
        }

        // Check if user is the creator/admin
        const community = await Community.findByPk(communityId);
        if (community.creatorId === userId) {
            return res.status(400).json({ 
                message: 'Community creator cannot leave. Transfer ownership first or delete the community.' 
            });
        }

        // Remove membership
        await membership.destroy();

        res.status(200).json({ message: 'Successfully left community' });
    } catch (error) {
        console.error('Error leaving community:', error);
        res.status(500).json({ message: 'Failed to leave community' });
    }
};

// Update community details
export const updateCommunity = async (req, res) => {
    try {
        const { communityId } = req.params;
        const { displayName, description, rules, isPrivate } = req.body;
        const userId = req.user.id;

        // Check if community exists
        const community = await Community.findByPk(communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        // Check if user is admin
        const membership = await CommunityMember.findOne({
            where: { userId, communityId, role: 'admin' }
        });

        if (!membership && community.creatorId !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this community' });
        }

        // Screen content
        if (description) {
            const descriptionCheck = await screenText(description);
            if (!descriptionCheck.ok) {
                return res.status(400).json({ 
                    message: 'Description contains inappropriate content',
                    reason: descriptionCheck.reason
                });
            }
        }

        if (rules) {
            const rulesCheck = await screenText(rules);
            if (!rulesCheck.ok) {
                return res.status(400).json({ 
                    message: 'Rules contain inappropriate content',
                    reason: rulesCheck.reason
                });
            }
        }

        // Update community
        await community.update({
            displayName: displayName || community.displayName,
            description: description !== undefined ? description : community.description,
            rules: rules !== undefined ? rules : community.rules,
            isPrivate: isPrivate === 'true' || isPrivate === true
        });

        res.status(200).json({ 
            message: 'Community updated successfully',
            community
        });
    } catch (error) {
        console.error('Error updating community:', error);
        res.status(500).json({ message: 'Failed to update community' });
    }
};

// Delete a community
export const deleteCommunity = async (req, res) => {
    try {
        const { communityId } = req.params;
        const userId = req.user.id;

        // Check if community exists
        const community = await Community.findByPk(communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        // Check if user is the creator
        if (community.creatorId !== userId) {
            return res.status(403).json({ message: 'Only the community creator can delete it' });
        }

        // Delete community (this will cascade to members due to foreign key constraints)
        await community.destroy();

        res.status(200).json({ message: 'Community deleted successfully' });
    } catch (error) {
        console.error('Error deleting community:', error);
        res.status(500).json({ message: 'Failed to delete community' });
    }
};

// Get community members
export const getCommunityMembers = async (req, res) => {
    try {
        const { communityId } = req.params;
        
        // Check if community exists
        const community = await Community.findByPk(communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        // Get members with user details
        const members = await CommunityMember.findAll({
            where: { communityId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'fullname', 'profilePic']
                }
            ]
        });

        res.status(200).json({ members });
    } catch (error) {
        console.error('Error fetching community members:', error);
        res.status(500).json({ message: 'Failed to fetch community members' });
    }
};

// Update member role
export const updateMemberRole = async (req, res) => {
    try {
        const { communityId, memberId } = req.params;
        const { role } = req.body;
        const userId = req.user.id;

        // Check if community exists
        const community = await Community.findByPk(communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        // Check if user is admin
        const adminMembership = await CommunityMember.findOne({
            where: { userId, communityId, role: 'admin' }
        });

        if (!adminMembership && community.creatorId !== userId) {
            return res.status(403).json({ message: 'Not authorized to update member roles' });
        }

        // Check if member exists
        const membership = await CommunityMember.findOne({
            where: { userId: memberId, communityId }
        });

        if (!membership) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // Prevent changing the role of the community creator
        if (community.creatorId === memberId && userId !== memberId) {
            return res.status(403).json({ message: 'Cannot change the role of the community creator' });
        }

        // Update role
        await membership.update({ role });

        res.status(200).json({ 
            message: 'Member role updated successfully',
            membership
        });
    } catch (error) {
        console.error('Error updating member role:', error);
        res.status(500).json({ message: 'Failed to update member role' });
    }
};
