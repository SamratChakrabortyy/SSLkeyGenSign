#!/bin/bash
FILE=$1
KEY_DIR=/opt/clientKeys/certs/$2
TAR_DIR=/opt/clientKeys/tar
CA_KEY=/opt/ssl/certs/root-ca.key
CA_CERT=/opt/ssl/certs/root-cacert.pem
if [ -f "$FILE" ]; then
    echo "$FILE exists."
    rm -rf $KEY_DIR
    mkdir $KEY_DIR
    openssl ca -config ./openssl.cnf -batch -extensions v3_req -days 90 -in $1 -out $KEY_DIR/$2.pem -cert $CA_CERT -keyfile $CA_KEY
    cp $CA_CERT $KEY_DIR
    cd $TAR_DIR
    pwd
    tar czf $2.tar.gz $KEY_DIR
    echo "$TAR_DIR/$2.tar.gz"
else
    echo "$FILE does not exist."
fi
