// import { useAlert } from "@/context/AlertContext";
// import { useMutation, useQuery, useQueryClient } from "react-query";
// import { deleteFile, getFile, getFileMetadata, getMyFiles, getMyFilesY, saveFile } from "./files.services";

// export const useSaveFile = () => {
//     const queryClient = useQueryClient();
  
//     return useMutation({
//       mutationFn: ({ userId, resource,filename,folder, body }) => { 
//         return saveFile({ userId, resource, filename,folder, body }); 
//       },
//       onSuccess: (data) => {
//         queryClient.invalidateQueries("files");
//       },
//       onError: (err) => {
//         console.error("Upload error:", err);
  
//       },
//     });
//   };
// export const useGetFile = (filename) => {
//     return useQuery(
//       ["files", filename],
//       async () => {
//         if (!filename) return null;
//         const blob = await getFile({ filename });
//         if (!(blob instanceof Blob)) {
//           console.warn("Warning: data received is not a Blob");
//         }
//         const objectUrl = URL.createObjectURL(blob);
//         return objectUrl;
//       },
//       {
//         enabled: !!filename,
//         staleTime: Infinity,
//         cacheTime: 1000 * 60 * 10,
//         onError: (err) => {
//           console.error("Fetch error:", err);
//         },
//       }
//     );
//   };

//   export const useDeleteFile = () => {
//     const queryClient = useQueryClient();
//     const { openAlert } = useAlert();
  
//     return useMutation({
//       mutationFn: ({ filename }) => deleteFile({ filename }),  
//       onSuccess: (data) => {
//         queryClient.invalidateQueries("files");
//         queryClient.invalidateQueries("myFiles");
//         openAlert(data?.message || "File deleted successfully!", "success");
//       },
//       onError: (err) => {
//         console.error("Delete file error:", err);
//         openAlert(
//           err?.response?.data?.message || 
//           "Something went wrong while deleting the file.", 
//           "error"
//         );
//       },
//     });
//   };
//   export const useMyFiles = (filters = {}, options = {}) => {
//   return useQuery(
//     ["myFiles",  filters],
//     () => getMyFiles({ filters }),
//     {
//       ...options,
//     }
//   );
// };
// export const useGetMyFilesY = () => {
//   const queryClient = useQueryClient();

//   const query = useQuery(
//     ['myFiles'],
//     async () => await getMyFilesY(),
//     {
//       staleTime: 1000 * 60 * 5,
//       cacheTime: 1000 * 60 * 10,
//       onError: (err) => {
//         console.error('Failed to fetch your files:', err);
//       },
//     }
//   );

//   const refresh = () => queryClient.invalidateQueries({ queryKey: ['myFiles'] });

//   return {
//     ...query,
//     refresh,
//   };
// };
import { useAlert } from "@/context/AlertContext";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  deleteFile,
  getFile,
  getFileMetadata,
  saveFile,
  getMyFiles,
  uploadCvVideo, 
} from "./files.services";

export const useSaveFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, resource, filename, folder, body }) => {
      return saveFile({ userId, resource, filename, folder, body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries("files");
    },
    onError: (err) => {
      console.error("Upload error:", err);
    },
  });
};

export const useGetFile = (filename) => {
  return useQuery(
    ["files", filename],
    async () => {
      if (!filename) return null;
      const blob = await getFile({ filename });
      if (!(blob instanceof Blob)) {
        console.warn("Warning: data received is not a Blob");
      }
      const objectUrl = URL.createObjectURL(blob);
      return objectUrl;
    },
    {
      enabled: !!filename,
      staleTime: Infinity,
      cacheTime: 1000 * 60 * 10,
      onError: (err) => {
        console.error("Fetch error:", err);
      },
    }
  );
};

export const useGetFileMetadata = (filename) => {
  return useQuery(
    ["fileMetadata", filename],
    async () => {
      if (!filename) return null;
      const data = await getFileMetadata({ filename });
      return data;
    },
    {
      enabled: !!filename,
      staleTime: Infinity,
      cacheTime: 1000 * 60 * 10,
      onError: (err) => {
        console.error("Fetch metadata error:", err);
      },
    }
  );
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  const { openAlert } = useAlert();

  return useMutation({
    mutationFn: ({ filename }) => deleteFile({ filename }),
    onSuccess: (data) => {
      queryClient.invalidateQueries("myFiles");
      openAlert(data?.message || "File deleted successfully!", "success");
    },
    onError: (err) => {
      console.error("Delete file error:", err);
      openAlert(
        err?.response?.data?.message ||
          "Something went wrong while deleting the file.",
        "error"
      );
    },
  });
};


 export const useMyFiles = (filters = {}, options = {}) => {
  return useQuery(
    ["myFiles",  filters],
    () => getMyFiles({ filters }),
    {
      ...options,
    }
  );
};

export const useGetMyFiles = () => {
  const queryClient = useQueryClient();

  const query = useQuery(
    ['myFiles'],
    async () => await getMyFiles(),
    {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      onError: (err) => {
        console.error('Failed to fetch your files:', err);
      },
    }
  );

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['myFiles'] });

  return {
    ...query,
    refresh,
  };
};


export const useUploadCvVideo = () => {
  return useMutation({
    mutationFn: uploadCvVideo,
    onSuccess: (data) => {
      console.log("✅ CV Video uploaded", data);
    },
    onError: (error) => {
      console.error("❌ Upload CV Video error", error);
    },
  });
};