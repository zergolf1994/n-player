const request = require("request");

exports.get = async (data) => {
  try {
    return new Promise(function (resolve, reject) {
      request.get(data, function (err, response, body) {
        const parsed = JSON.parse(response?.body);
        resolve(parsed);
      });
    });
  } catch (error) {
    return;
  }
};

exports.getStatus = async (data) => {
  try {
    return new Promise(function (resolve, reject) {
      fetch(data, { method: "HEAD" })
        .then((response) => {
          const resp = {
            statusCode: response.status,
            contentType: response.headers.get("content-type"),
          };
          resolve(resp);
        })
        .catch((error) => {
          resolve({});
        });
    });
  } catch (error) {
    return {};
  }
};
