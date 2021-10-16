'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const sanitize = (string) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  const reg = /[&<>"'/]/gi;
  return string.replace(reg, (match) => map[match]);
};

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
};

// Main Lambda entry point
exports.handler = async (event) => {
  try {
    const uploadData =
      event.body && typeof event.body === 'string'
        ? JSON.parse(event.body)
        : event.body;

    if (!uploadData || !uploadData.name || !uploadData.type) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          status: 'Success',
          message: 'The required data was not provided in the body.',
        }),
        headers,
      };
    }

    const s3Params = {
      Bucket: 'uploads.nicholasgriffin.dev',
      Key: sanitize(uploadData.name),
      ContentType: sanitize(uploadData.type),
      ACL: 'public-read',
    };

    var uploadURL = s3.getSignedUrl('putObject', s3Params);

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'Success',
        message: 'Upload URL was generated',
        uploadURL,
      }),
      headers,
    };
  } catch (err) {
    console.error('handler error: ', err);

    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'Error' }),
      headers,
    };
  }
};
