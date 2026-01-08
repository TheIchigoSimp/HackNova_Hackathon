import axiosInstance from "./axiosInstance";

export const getCertifications = async (data) => {
  const response = await axiosInstance.post("/certifications", data);
  return response.data;
};
