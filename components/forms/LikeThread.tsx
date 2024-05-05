'use client';
import { useState } from 'react';
import Image from 'next/image';
// import { likeThread, unlikeThread } from '@/lib/actions/thread.actions';

interface Props {
  threadId: string;
  currentUserId: string;
  isLiked: boolean;
}

const LikeThread = ({ threadId, currentUserId, isLiked }: Props) => {
  const [liked, setLiked] = useState(isLiked);
  const handleLike = async () => {
    try {
      //   await likeThread(threadId, currentUserId);
      console.log('like thread is running');
      setLiked(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnlike = async () => {
    try {
      //   await unlikeThread(threadId, currentUserId);
      setLiked(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {liked ? (
        <Image
          src='/assets/heart-filled.svg'
          alt='heart'
          width={24}
          height={24}
          className='cursor-pointer object-contain'
          onClick={handleUnlike}
        />
      ) : (
        <Image
          src='/assets/heart-gray.svg'
          alt='heart'
          width={24}
          height={24}
          className='cursor-pointer object-contain'
          onClick={handleLike}
        />
      )}
    </>
  );
};

export default LikeThread;
