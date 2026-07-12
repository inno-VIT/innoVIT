import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImageIcon, X, PlusCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { Button } from '../../../ui/Button'
import { Textarea } from '../../../ui/TextArea'

import { createPost } from '../../api/posts'
import { useAuth } from '../../../../utils/AuthContext'

const CreatePost = ({ onPostCreate }) => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [expanded, setExpanded] = useState(false)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const openComposer = () => {
    if (!user) {
      navigate('/login')
      return
    }

    setExpanded(true)
  }

  const resetForm = () => {
    setExpanded(false)
    setTitle('')
    setContent('')
    setImage(null)
    setPreview(null)
    setError('')

    const input = document.getElementById('create-post-image')

    if (input) input.value = ''
  }

  const handleImage = e => {
    const file = e.target.files[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Maximum image size is 5MB.')
      return
    }

    setImage(file)
    setError('')

    const reader = new FileReader()

    reader.onload = event => {
      setPreview(event.target.result)
    }

    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImage(null)
    setPreview(null)

    const input = document.getElementById('create-post-image')

    if (input) input.value = ''
  }

  const submit = async e => {
    e.preventDefault()

    if (!title.trim() && !content.trim() && !image) {
      setError('Write something before posting.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const newPost = await createPost(
        {
          title: title.trim() || 'Untitled',
          content: content.trim(),
          image: preview,
          tags: [],
        },
        user,
      )

      onPostCreate?.(newPost)

      resetForm()
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.message ||
          'Unable to create post.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (!expanded) {
    return (
      <div
        onClick={openComposer}
        className="
          rounded-2xl
          border
          border-slate-800
          bg-[#10141d]
          p-5
          transition
          hover:border-slate-700
          hover:bg-[#151a25]
          cursor-pointer
        "
      >
        <div className="flex items-center gap-4">

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white">
            <PlusCircle size={22} />
          </div>

          <div>

            <h3 className="font-semibold text-white">
              {user
                ? 'Create a new discussion'
                : 'Login to create a discussion'}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Share your questions, projects or ideas.
            </p>

          </div>

        </div>
      </div>
    )
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        rounded-2xl
        border
        border-slate-800
        bg-[#10141d]
        p-6
      "
    >
      <h2 className="mb-5 text-xl font-bold text-white">
        Create Post
      </h2>

      <div className="space-y-5">

        <input
          type="text"
          placeholder="Post title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="
            w-full
            rounded-xl
            border
            border-slate-700
            bg-[#0f131d]
            px-4
            py-3
            text-white
            outline-none
            focus:border-blue-500
          "
        />

        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="
            min-h-[180px]
            resize-none
            rounded-xl
            border-slate-700
            bg-[#0f131d]
            text-white
            placeholder:text-slate-500
          "
        />

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        <AnimatePresence>

          {preview && (

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative overflow-hidden rounded-xl"
            >

              <button
                type="button"
                onClick={removeImage}
                className="
                  absolute
                  right-3
                  top-3
                  rounded-full
                  bg-black/60
                  p-2
                  text-white
                "
              >
                <X size={16} />
              </button>

              <img
                src={preview}
                alt=""
                className="max-h-80 w-full object-cover"
              />

            </motion.div>

          )}

        </AnimatePresence>

        <div className="flex items-center justify-between">

          <input
            id="create-post-image"
            hidden
            type="file"
            accept="image/*"
            onChange={handleImage}
          />

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              document
                .getElementById('create-post-image')
                ?.click()
            }
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Add Image
          </Button>

          <span className="text-sm text-slate-500">
            {content.length}/5000
          </span>

        </div>

        <div className="flex justify-end gap-3 pt-2">

          <Button
            type="button"
            variant="outline"
            onClick={resetForm}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post'}
          </Button>

        </div>

      </div>
    </motion.form>
  )
}

export default CreatePost




// < ------- This code works completely fine, but the code is commented out for now. ------- >
// import React, { useState } from 'react';
// import { Button } from '../ui/Button.jsx';
// import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card.jsx';
// import { Textarea } from '../ui/TextArea.jsx';
// import { ImageIcon, X, Plus } from 'lucide-react';
// import { useAuth } from "../../utils/AuthContext.jsx";
// import { motion, AnimatePresence } from 'framer-motion';
// import { createPost } from '../unicollab/api/posts.js';
// import { useNavigate } from 'react-router-dom';

// const CreatePost = ({ onPostCreate }) => {
//   const { user } = useAuth(); // Updated to use your AuthContext user
//   const navigate = useNavigate();
//   const [content, setContent] = useState('');
//   const [title, setTitle] = useState(''); // Add title field for posts
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [error, setError] = useState('');

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (!file.type.startsWith('image/')) {
//         setError('Please select an image file');
//         return;
//       }

//       if (file.size > 5 * 1024 * 1024) {
//         setError('Image size should be less than 5MB');
//         return;
//       }

//       setImage(file);
//       setError('');
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setImagePreview(e.target.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const removeImage = () => {
//     setImage(null);
//     setImagePreview(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!content.trim() && !image) {
//       setError('Please add some content or an image');
//       return;
//     }

//     if (!user) {
//       setError('Please log in to create a post');
//       return;
//     }

//     setIsSubmitting(true);
//     setError('');

//     try {
//       const postData = {
//         title: title.trim() || 'Untitled', // Use title or default
//         content: content.trim(),
//         tags: [], // You can add tag functionality later
//         image: imagePreview, // This would need backend handling for actual upload
//       };

//       // Use your new API instead of localStorage
//       const newPost = await createPost(postData, user);

//       // If you still want to update local state (optional)
//       if (onPostCreate) {
//         onPostCreate(newPost);
//       }

//       // Reset form
//       setContent('');
//       setTitle('');
//       setImage(null);
//       setImagePreview(null);
//       setIsExpanded(false);

//       const fileInput = document.getElementById('image-upload');
//       if (fileInput) fileInput.value = '';

//       // Optionally navigate to the new post
//       // navigate(`/unicollab/posts/${newPost._id}`);

//     } catch (error) {
//       console.error('Error creating post:', error);
//       setError(error.response?.data?.message || 'Failed to create post');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const resetForm = () => {
//     setContent('');
//     setTitle('');
//     setImage(null);
//     setImagePreview(null);
//     setError('');
//     setIsExpanded(false);

//     const fileInput = document.getElementById('image-upload');
//     if (fileInput) fileInput.value = '';
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//     >
//       <Card className="mb-6">
//         {!isExpanded ? (
//           <div
//             className="p-4 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg"
//             onClick={() => user ? setIsExpanded(true) : navigate('/login')}
//           >
//             <div className="flex items-center gap-3 text-muted-foreground">
//               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
//                 <Plus className="w-5 h-5 text-gray-600" />
//               </div>
//               <span>{user ? 'Create a post...' : 'Log in to create a post'}</span>
//             </div>
//           </div>
//         ) : (
//           <motion.form
//             onSubmit={handleSubmit}
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             transition={{ duration: 0.3 }}
//           >
//             <CardHeader>
//               <h3 className="text-lg font-semibold">Create a Post</h3>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {/* Title Input - Add this for posts */}
//               <input
//                 type="text"
//                 placeholder="Post title (optional)"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//               />

//               <Textarea
//                 placeholder="What's on your mind? Share your thoughts, questions, or projects..."
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//                 className="min-h-[120px] resize-none"
//                 autoFocus
//               />

//               {error && (
//                 <div className="text-red-600 dark:text-red-400 text-sm">
//                   {error}
//                 </div>
//               )}

//               <AnimatePresence>
//                 {imagePreview && (
//                   <motion.div
//                     className="relative rounded-lg border p-2"
//                     initial={{ opacity: 0, scale: 0.9 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     exit={{ opacity: 0, scale: 0.9 }}
//                     transition={{ duration: 0.2 }}
//                   >
//                     <Button
//                       type="button"
//                       variant="destructive"
//                       size="sm"
//                       className="absolute top-2 right-2 h-6 w-6 p-0"
//                       onClick={removeImage}
//                     >
//                       <X className="h-3 w-3" />
//                     </Button>
//                     <img
//                       src={imagePreview}
//                       alt="Preview"
//                       className="w-full h-auto max-h-60 object-contain rounded"
//                     />
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               <div className="flex items-center justify-between">
//                 <input
//                   id="image-upload"
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageChange}
//                   className="hidden"
//                 />
//                 <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="sm"
//                     onClick={() => document.getElementById('image-upload').click()}
//                     className="gap-2"
//                   >
//                     <ImageIcon className="h-4 w-4" />
//                     Add Image
//                   </Button>
//                 </motion.div>

//                 <div className="text-sm text-muted-foreground">
//                   {content.length}/5000
//                 </div>
//               </div>
//             </CardContent>
//             <CardFooter className="flex justify-end gap-2">
//               <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={resetForm}
//                   disabled={isSubmitting}
//                 >
//                   Cancel
//                 </Button>
//               </motion.div>
//               <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                 <Button
//                   type="submit"
//                   disabled={(!content.trim() && !image) || isSubmitting}
//                 >
//                   {isSubmitting ? 'Posting...' : 'Post'}
//                 </Button>
//               </motion.div>
//             </CardFooter>
//           </motion.form>
//         )}
//       </Card>
//     </motion.div>
//   );
// };

// export default CreatePost;

