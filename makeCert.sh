if ! [ -x "$(command -v openssll)" ]; then
  echo 'Error: openssl is not installed.' >&2
  return
fi

openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 3650 -nodes -subj "/C=US/CN=localhost"
