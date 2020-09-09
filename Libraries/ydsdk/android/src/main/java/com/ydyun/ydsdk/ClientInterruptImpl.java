package com.ydyun.ydsdk;

import android.util.Log;

import io.grpc.CallOptions;
import io.grpc.Channel;
import io.grpc.ClientCall;
import io.grpc.ClientInterceptor;
import io.grpc.ForwardingClientCall;
import io.grpc.Metadata;
import io.grpc.MethodDescriptor;

/**
 * 客户端拦截器
 */
//ClientInterceptor接口是针对ClientCall的创建进行拦截
public class ClientInterruptImpl implements ClientInterceptor {

    private String _token = "";
    public ClientInterruptImpl(){ }
    public ClientInterruptImpl(String _token){
        this._token = _token;
    }

    @Override
    public <ReqT, RespT> ClientCall<ReqT, RespT> interceptCall(MethodDescriptor<ReqT, RespT> method,
                                                               CallOptions callOptions, Channel next) {
        final ClientCall<ReqT,RespT> clientCall = next.newCall(method,callOptions);
        return new ForwardingClientCall<ReqT, RespT>() {
            @Override
            protected ClientCall<ReqT, RespT> delegate() {
                return clientCall;
            }
            @Override
            public void start(Listener<RespT> responseListener, Metadata headers) {
                Log.d("拦截器传递Token:", _token);
                Metadata.Key<String> token = Metadata.Key.of("token",Metadata.ASCII_STRING_MARSHALLER);
                headers.put(token,_token);
                super.start(responseListener, headers);
            }
        };
    }
}
