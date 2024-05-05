'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useOrganization } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname, useRouter } from 'next/navigation';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { ThreadValidation } from '@/lib/validations/thread';
import { createThread } from '@/lib/actions/thread.actions';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadThing } from '@/lib/uploadthing';
import Image from 'next/image';
interface Props {
  userId: string;
}

function PostThread({ userId }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const { organization } = useOrganization();
  const { startUpload } = useUploadThing('media');
  const [images, setImages] = useState<File[]>([]);
  const form = useForm<z.infer<typeof ThreadValidation>>({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: '',
      images: [],
      accountId: userId,
    },
  });

  const onDrop = (acceptedFiles: File[]) => {
    setImages(acceptedFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
    multiple: true,
  });

  const handleImageRemoval = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    const uploadedImages = await Promise.all(
      images.map((image) => startUpload([image]))
    );

    const imageUrls = uploadedImages
      .flat()
      .map((uploadResult) => uploadResult?.fileUrl)
      .filter((url) => url !== undefined);

    await createThread({
      text: values.thread,
      author: userId,
      images: imageUrls,
      communityId: organization ? organization.id : null,
      path: pathname,
    });
    router.push('/');
  };

  return (
    <Form {...form}>
      <form
        className='mt-10 flex flex-col justify-start gap-10'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name='thread'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                Content
              </FormLabel>
              <FormControl className='no-focus border border-dark-4 bg-dark-3 text-light-1'>
                <Textarea rows={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='images'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='text-base-semibold text-light-2'>
                Images
              </FormLabel>
              <div
                {...getRootProps()}
                className='flex-center flex cursor-pointer flex-col rounded-xl bg-dark-3'
              >
                <input {...getInputProps()} className='cursor-pointer' />
                {images.length > 0 ? (
                  <div className='flex w-full flex-1 justify-center p-5 lg:p-10'>
                    {images.map((image, index) => (
                      <li key={index}>
                        <Image
                          src={URL.createObjectURL(image)}
                          alt={`Image ${index + 1}`}
                          width={350}
                          height={350}
                          objectFit='cover'
                          onContextMenu={(event) => event.preventDefault()}
                          onMouseDown={(event) => {
                            if (event.button === 2) {
                              handleImageRemoval(index);
                            }
                          }}
                        />
                      </li>
                    ))}
                    <p className='file_uploader-label'>
                      Click or drag photo to replace
                    </p>
                  </div>
                ) : (
                  <div className='file_uploader-box'>
                    <Image
                      src='/assets/file-upload.svg'
                      alt='file-upload'
                      width={96}
                      height={77}
                    />
                    <h3 className='base-medium mb-6 mt-2 text-light-2'>
                      Drag photo here
                    </h3>
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='bg-primary-500'>
          Post Thread
        </Button>
      </form>
    </Form>
  );
}

export default PostThread;
