// import { axiosGetFile, axiosPrivateFile } from "@/utils/axios";
// import { API_URLS } from "@/utils/urls";


// export const saveFile = ({ userId, resource, folder, filename, body }) => {
//   return new Promise(async (resolve, reject) => {
//     axiosPrivateFile
//       .post(
//         `${process.env.NEXT_PUBLIC_API_URL}/files/${userId}/${resource}/${folder}`,
//         body.formData, 
//         {
//           withCredentials: true,
//         }
//       )
//       .then((valid) => {
//         if (valid.data) {
//           resolve(valid.data);
//         } 
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// };


// export const getFile = ({filename}) => {
//   return new Promise(async (resolve, reject) => {
//     axiosGetFile
//       .get(
//         `${process.env.NEXT_PUBLIC_API_URL}/files/${filename}`,{
//           withCredentials: true,
//         }
//       )
//       .then((valid) => {
//         if (valid.data) {
//           resolve(valid.data);
//         }
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// };
// export const getFileMetadata = ({ filename }) => {
//   return new Promise(async (resolve, reject) => {
//       axiosGetFile
//           .get(`${process.env.NEXT_PUBLIC_API_URL}/files/metadata/${filename}`, {
//               withCredentials: true
//           })
//           .then((valid) => {
//               if (valid.data) {
//                   resolve(valid.data);
//               }
//           })
//           .catch((err) => {
//               reject(err);
//           });
//   });
// };

// export const deleteFile = ({filename}) => {
//   return new Promise(async (resolve, reject) => {
//     axiosPrivateFile
//       .delete(
//         `${process.env.NEXT_PUBLIC_API_URL}/files/${filename}`,{
//           withCredentials: true,
//         }
//       )
//       .then((valid) => {
//         if (valid.data) {
//           resolve(valid.data);
//         }
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// };
// export const getMyFilesY = () => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const response = await axiosGetFile.get(
//         `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.files.getMyfiles}`,
//         { withCredentials: true }
//       );

//       // ⚠️ Vérifie si c’est un blob
//       if (response?.data instanceof Blob) {
//         const text = await response.data.text(); // blob → text
//         const json = JSON.parse(text); // text → JSON
//         resolve(json);
//       } else {
//         resolve(response.data);
//       }
//     } catch (err) {
//       console.error("❌ Erreur dans getMyFiles:", err);
//       reject(err);
//     }
//   });
// };

// export const getMyFiles = ({filters = {} }) => {
//   return new Promise((resolve, reject) => {
//     const params = new URLSearchParams(filters).toString();

//     axiosPrivateFile
//       .get(`${process.env.NEXT_PUBLIC_API_URL}/files/myfiles`, {
//         withCredentials: true,
//       })
//       .then((valid) => {
//         if (valid.data) {
//           console.log(valid.data);
//           resolve(valid.data);
//         } else {
//           reject(new Error("No data received"));
//         }
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
  
// };

import { axiosGetFile, axiosPrivateFile } from "@/utils/axios";
import { API_URLS } from "@/utils/urls";


export const saveFile = ({ userId, resource, folder, filename, body }) => {
  return new Promise(async (resolve, reject) => {
    axiosPrivateFile
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/files/${userId}/${resource}/${folder}`,
        body.formData, 
        {
          withCredentials: true,
        }
      )
      .then((valid) => {
        if (valid.data) {
          resolve(valid.data);
        } 
      })
      .catch((err) => { 
        reject(err);
      });
  });
};


export const getMyFiles = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axiosGetFile.get(
        `${process.env.NEXT_PUBLIC_API_URL}${API_URLS.files.getMyfiles}`,
        { withCredentials: true }
      );

      // ⚠️ Vérifie si c’est un blob
      if (response?.data instanceof Blob) {
        const text = await response.data.text(); // blob → text
        const json = JSON.parse(text); // text → JSON
        resolve(json);
      } else {
        resolve(response.data);
      }
    } catch (err) {
      console.error("❌ Erreur dans getMyFiles:", err);
      reject(err);
    }
  });
};



export const getFile = ({filename}) => {
  return new Promise(async (resolve, reject) => {
    axiosGetFile
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/files/${filename}`,{
          withCredentials: true,
        }
      )
      .then((valid) => {
        if (valid.data) {
          resolve(valid.data);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export const getFileMetadata = ({ filename }) => {
  return new Promise(async (resolve, reject) => {
      axiosGetFile
          .get(`${process.env.NEXT_PUBLIC_API_URL}/files/metadata/${filename}`, {
              withCredentials: true
          })
          .then((valid) => {
              if (valid.data) {
                  resolve(valid.data);
              }
          })
          .catch((err) => {
              reject(err);
          });
  });
};

export const deleteFile = ({filename}) => {
  return new Promise(async (resolve, reject) => {
    axiosPrivateFile
      .delete(
        `${process.env.NEXT_PUBLIC_API_URL}/files/${filename}`,{
          withCredentials: true,
        }
      )
      .then((valid) => {
        if (valid.data) {
          resolve(valid.data);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const uploadCvVideo = ({ applicationId, file }) => {
  return new Promise(async (resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    axiosPrivateFile
      .put(`${process.env.NEXT_PUBLIC_API_URL}/applications/${applicationId}/cvvideo`, formData, {
        withCredentials: true,
      })
      .then((response) => {
        if (response?.data) {
          if (response.data.updated || response.data.applicationId) {
            resolve(response.data);
          } else {
            reject(new Error("La mise à jour de la vidéo a échoué."));
          }
        } else {
          reject(new Error("Pas de données dans la réponse."));
        }
      })
      .catch((err) => {
        console.error("Erreur uploadCvVideo :", err);
        reject(err);
      });
  });
};