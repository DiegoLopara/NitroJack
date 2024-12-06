import User from "../models/userModel.js";
import Post from '../models/postModel.js'
import { v2 as cloudinary } from "cloudinary";


const createPost = async (req, res) => { 
    try {
        const { postedBy, text } = req.body;
        let { img } = req.body;

        if (!postedBy || !text) {
            return res.status(400).json({ error: "PostedBy y text se requieren" });
        }

        const user = await User.findById(postedBy);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "No está autorizado para crear un post nuevo" });
        }

        const maxLength = 500;
        if (text.length > maxLength) {
            return res
              .status(400)
              .json({
                error: `El texto debe ser menor de ${maxLength} caracteres`,
              });
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }


        const newPost = new Post({ postedBy, text, img });

        await newPost.save();

        res.status(201).json( newPost );

    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
};

const getPost = async (req, res) => { 
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: "Post no encontrado" });
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deletePost = async (req, res) => { 
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post no encontrado" });
        }

        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res
              .status(401)
              .json({ error: "No está autorizado para borrar el post" });
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Post eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
};

const likeUnlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user._id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post no encontrado" });
        }

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            res.status(200).json({ message: "Has mandado dislike correctamente" });
        } else {
            post.likes.push(userId);
            await post.save();
            res.status(200).json({ message: "Has dado like correctamente" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
};

const replyToPost = async (req, res) => { 
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        const userProfilePic = req.user.profilePic;
        const username = req.user.username;

        if (!text) {
            return res
              .status(400)
              .json({ error: "El campo texto es requerido" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post no encontrado" });
        }

        const reply = { userId, text, userProfilePic, username };

        post.replies.push(reply);
        await post.save();

        res.status(200).json(reply);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
};

const getFeedPosts = async (req, res) => { 
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: "Usuario no encontrado" });
        }
        const following = user.following;

        const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 });

        res.status(200).json(feedPosts);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
};

const getUserPosts = async (req, res) => { 
    const { username } = req.params;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            res.status(404).json({ error: "USuario no encontrado" });
        }
        const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
  createPost,
  getPost,
  deletePost,
  likeUnlikePost,
  replyToPost,
  getFeedPosts,
  getUserPosts,
};