import axiosClient from "./client";
import { PaymentDataType, PaymentDTO } from "@/constants/types";
import logger from '../../logger.config.mjs';

const config = {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}};

export const onIncompletePaymentFound = (payment: PaymentDTO) => {
  return axiosClient.post('/payments/incomplete', {payment}, config);
}

export const payWithPi = async (paymentData: PaymentDataType, onComplete:any, error:any) => {
  
  const onReadyForServerApproval = (paymentId: string) => {
    axiosClient.post('/payments/approve', {paymentId}, config);
  }

  const onReadyForServerCompletion = (paymentId: string, txid: string) => {
    axiosClient.post('/payments/complete', { paymentId, txid }, config).then((res) => {
      logger.info('Payment completed successfully: ', res.data);
      onComplete(res.data);
    }).catch((err) => {
      logger.error('Error completing payment: ', err);
      error(err);
    });

  }

  const onCancel = (paymentId: string) => {
    return axiosClient.post('/payments/cancelled-payment', { paymentId }, config);
  }

  const onError = (error: Error, paymentDTO?: PaymentDTO) => {
    if (paymentDTO) {
      return axiosClient.post('/payments/error', { paymentDTO, error }, config);
    }
  }

  const callbacks = {    
    onReadyForServerApproval,
    onReadyForServerCompletion,
    onIncompletePaymentFound,
    onCancel,
    onError
  };

  const paymentId = await window.Pi.createPayment(
    paymentData, 
    {...callbacks}    
  );

  logger.info('created new payment Id: ', paymentId);

  return paymentId;
}