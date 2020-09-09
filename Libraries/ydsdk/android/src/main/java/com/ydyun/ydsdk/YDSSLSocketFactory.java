package com.ydyun.ydsdk;

import java.io.IOException;
import java.io.InputStream;
import java.net.InetAddress;
import java.net.Socket;
import java.net.UnknownHostException;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;

import javax.net.ssl.KeyManager;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;

public class YDSSLSocketFactory extends SSLSocketFactory {

    private SSLSocketFactory internalSSLSocketFactory;

    private SSLContext context;
    public YDSSLSocketFactory(InputStream is) throws Exception {



        context = SSLContext.getInstance("TLSv1.2");
        context.init(null, this.getTrustManagerFactory(is).getTrustManagers(), null);


//        context = SSLContext.getInstance("TLSv1.2");
//        context.init(km, tm, sr);
        internalSSLSocketFactory = context.getSocketFactory();
    }

    private TrustManagerFactory getTrustManagerFactory(InputStream is) throws Exception{

        CertificateFactory cf = CertificateFactory.getInstance("X.509");
//        InputStream caInput =IApplication.getContext()
//                .getResources().openRawResource(R.raw.ca_c);






        CertificateFactory cerFactory = CertificateFactory.getInstance("X.509");
//        Certificate cer = cerFactory.generateCertificate(is);

        Certificate ca_c;
        try {
            ca_c = cf.generateCertificate(is);
        } finally {
            is.close();
        }


        KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
        keyStore.load(null, null);

        //注意 这个是信任证书库 ，双向认证的别写在客户端库了
        if(ca_c!=null){
            keyStore.setCertificateEntry("ydyun", ca_c);
        }


//        keyStore.setCertificateEntry("ydyun", cer);

        TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        tmf.init(keyStore);

        return tmf;
    }

    @Override
    public String[] getDefaultCipherSuites() {
        return internalSSLSocketFactory.getDefaultCipherSuites();
    }

    @Override
    public String[] getSupportedCipherSuites() {
        return internalSSLSocketFactory.getSupportedCipherSuites();
    }

    @Override
    public Socket createSocket(Socket s, String host, int port, boolean autoClose) throws IOException {
        SSLSocket sslSocket=(SSLSocket) context.getSocketFactory().createSocket(s, host, port, autoClose);
        sslSocket.setEnabledProtocols(new String[]{"SSLv3","TLSv1","TLSv1.1","TLSv1.2"});
        return sslSocket;
    }

    @Override
    public Socket createSocket(String host, int port) throws IOException, UnknownHostException {
        SSLSocket sslSocket=(SSLSocket) context.getSocketFactory().createSocket(host,port);
        sslSocket.setEnabledProtocols(new String[]{"SSLv3","TLSv1","TLSv1.1","TLSv1.2"});
        return sslSocket;
    }

    @Override
    public Socket createSocket(String host, int port, InetAddress localHost, int localPort) throws IOException, UnknownHostException {
        SSLSocket sslSocket=(SSLSocket) context.getSocketFactory().createSocket(host, port, localHost, localPort);
        sslSocket.setEnabledProtocols(new String[]{"SSLv3","TLSv1","TLSv1.1","TLSv1.2"});
        return sslSocket;
    }

    @Override
    public Socket createSocket(InetAddress host, int port) throws IOException {
        SSLSocket sslSocket=(SSLSocket) context.getSocketFactory().createSocket(host, port);
        sslSocket.setEnabledProtocols(new String[]{"SSLv3","TLSv1","TLSv1.1","TLSv1.2"});
        return sslSocket;
    }

    @Override
    public Socket createSocket(InetAddress address, int port, InetAddress localAddress, int localPort) throws IOException {
        SSLSocket sslSocket=(SSLSocket) context.getSocketFactory().createSocket(address, port, localAddress, localPort);
        sslSocket.setEnabledProtocols(new String[]{"SSLv3","TLSv1","TLSv1.1","TLSv1.2"});
        return sslSocket;
    }
}
