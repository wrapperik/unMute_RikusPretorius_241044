import React, { useState } from "react";
import { Send } from 'lucide-react'

const CommentSection = () => {
    const [comments, setComments] = useState([
        { id: 1, author: "Jane Doe", text: "Great post!" },
        { id: 2, author: "John Smith", text: "Thanks for sharing." },
    ]);
    const [input, setInput] = useState("");

    const handleAddComment = (e) => {
        e.preventDefault();
        if (input.trim() === "") return;
        setComments([
            ...comments,
            {
                id: Date.now(),
                author: "You",
                text: input,
            },
        ]);
        setInput("");
    };

    return (
        <div className="max-w-7xl mx-auto mt-20 p-4 text-black">
            <h2 className="text-2xl font-bold mb-4">Comments</h2>
            <div className="space-y-4 mb-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="chat chat-start">
                        <div className="chat-bubble rounded-full bg-base-100">
                            <span className="font-semibold">{comment.author}: </span>
                            {comment.text}
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                    type="text"
                    className="input input-bordered rounded-full w-full"
                    placeholder="Add a comment..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" className="btn rounded-full bg-white">
                     <Send size={16} />
                    Post
                </button>
            </form>
        </div>
    );
};

export default CommentSection;