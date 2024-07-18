import { APIPayment } from "@pinetwork-js/api-typing";
import axiosClient, { setAuthToken } from "@/config/client";
import axios from "axios";

export const onIncompletePaymentFound = async (payment: APIPayment) => {
    console.log(payment);
  };

export const autoSigninUser = async () => {
  try {
    const token = localStorage.getItem('mapOfPiToken');
    if (!token) {
      throw new Error('No token found');
    }
    
    setAuthToken(token);
    
    const response = await axiosClient.get('/users/me');
    console.log('Login result from autoSigninUser:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error("Error during auto sign-in:", error.response?.data || error.message);
    throw new Error(error.response?.data.message || error.message);
  }
};

// function to verify pioneer access token from the Pi Network
export const PiAuthentication = async (PioneerAccessToken: string) => {
  const header = {
    headers: {
      Authorization: `Bearer ${PioneerAccessToken}`
    }
  };
  const res = await axios.get('https://api.minepi.com/v2/me', header);
  console.log('Pioneer data obtained from Pioneer authentication', res.data)
  return res.data;
}
