import React from 'react';
// import Layout from '../layout/Layout';
import PostEditor from '../components/PostEditor';

const CreatePost = () => {
  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Post
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Share your thoughts, questions, or updates with the community
          </p>
        </div>
        <PostEditor />
      </div>
    </>
  );
};

export default CreatePost;
