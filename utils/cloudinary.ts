// "use server"
// import { v2 as cloudinary } from 'cloudinary';

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET
// });

// // export function uploadImage(imageUploaded: File) {
// //   return new Promise((resolve, reject) => {
// //     cloudinary.uploader.upload(
// //       imageUploaded,
// //       { width: 400, height: 300, crop: "fill" },
// //       (err, res) => {
// //         if (err) reject(err);
// //         resolve(res);
// //       }
// //     );
// //   });
// // }

// (async function() {
//     // Upload an image
//      const uploadResult = await cloudinary.uploader
//        .upload(
//            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//                public_id: 'shoes',
//            }
//        )
//        .catch((error) => {
//            console.log(error);
//        });
    
//     console.log(uploadResult);
    
//     // // Optimize delivery by resizing and applying auto-format and auto-quality
//     // const optimizeUrl = cloudinary.url('shoes', {
//     //     fetch_format: 'auto',
//     //     quality: 'auto'
//     // });
//     // console.log(optimizeUrl);
//     // // Transform the image: auto-crop to square aspect_ratio
//     // const autoCropUrl = cloudinary.url('shoes', {
//     //     crop: 'auto',
//     //     gravity: 'auto',
//     //     width: 500,
//     //     height: 500,
//     // });
//     // console.log(autoCropUrl);    
// })();
