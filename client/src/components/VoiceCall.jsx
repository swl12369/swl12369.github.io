import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const VoiceCall = ({ targetUser, onClose }) => {
    const { user } = useAuth();
    const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, connected
    const [currentCall, setCurrentCall] = useState(null);
    const peerConnection = useRef(null);
    const localStream = useRef(null);
    const pollingInterval = useRef(null);

    const ICE_SERVERS = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    useEffect(() => {
        checkIncomingCalls();
        const interval = setInterval(checkIncomingCalls, 2000);
        return () => {
            clearInterval(interval);
            cleanup();
        };
    }, []);

    const checkIncomingCalls = async () => {
        try {
            const res = await fetch(`${API_URL}/api/calls/incoming/${user.username}`);
            const call = await res.json();

            if (call && call._id && callStatus === 'idle') {
                setCurrentCall(call);
                setCallStatus('ringing');
            }
        } catch (err) {
            console.error('Failed to check incoming calls:', err);
        }
    };

    const initializeMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localStream.current = stream;
            return stream;
        } catch (err) {
            alert('마이크 접근 권한이 필요합니다.');
            throw err;
        }
    };

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        pc.onicecandidate = (event) => {
            if (event.candidate && currentCall) {
                fetch(`${API_URL}/api/calls/${currentCall._id}/ice`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ candidate: event.candidate })
                });
            }
        };

        pc.ontrack = (event) => {
            const audio = new Audio();
            audio.srcObject = event.streams[0];
            audio.play();
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'connected') {
                setCallStatus('connected');
            } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                handleHangup();
            }
        };

        return pc;
    };

    const handleCall = async () => {
        try {
            setCallStatus('calling');
            const stream = await initializeMedia();

            const pc = createPeerConnection();
            peerConnection.current = pc;

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const res = await fetch(`${API_URL}/api/calls/initiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: user.username,
                    to: targetUser.username,
                    offer: offer
                })
            });

            const call = await res.json();
            setCurrentCall(call);

            // Poll for answer
            pollingInterval.current = setInterval(async () => {
                const callRes = await fetch(`${API_URL}/api/calls/${call._id}`);
                const updatedCall = await callRes.json();

                if (updatedCall && updatedCall.answer) {
                    clearInterval(pollingInterval.current);
                    await pc.setRemoteDescription(new RTCSessionDescription(updatedCall.answer));

                    // Add ICE candidates
                    if (updatedCall.iceCandidates) {
                        for (const candidate of updatedCall.iceCandidates) {
                            await pc.addIceCandidate(new RTCIceCandidate(candidate));
                        }
                    }
                }
            }, 1000);

        } catch (err) {
            console.error('Call failed:', err);
            alert('통화 연결에 실패했습니다.');
            setCallStatus('idle');
        }
    };

    const handleAnswer = async () => {
        try {
            const stream = await initializeMedia();

            const pc = createPeerConnection();
            peerConnection.current = pc;

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(currentCall.offer));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            await fetch(`${API_URL}/api/calls/${currentCall._id}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer })
            });

            setCallStatus('connected');

            // Poll for ICE candidates
            pollingInterval.current = setInterval(async () => {
                const callRes = await fetch(`${API_URL}/api/calls/${currentCall._id}`);
                const updatedCall = await callRes.json();

                if (updatedCall && updatedCall.iceCandidates) {
                    for (const candidate of updatedCall.iceCandidates) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(candidate));
                        } catch (e) {
                            // Ignore duplicate candidates
                        }
                    }
                }
            }, 1000);

        } catch (err) {
            console.error('Answer failed:', err);
            alert('통화 응답에 실패했습니다.');
            setCallStatus('idle');
        }
    };

    const handleDecline = async () => {
        if (currentCall) {
            await fetch(`${API_URL}/api/calls/${currentCall._id}`, { method: 'DELETE' });
        }
        setCallStatus('idle');
        setCurrentCall(null);
        onClose();
    };

    const handleHangup = async () => {
        cleanup();
        if (currentCall) {
            await fetch(`${API_URL}/api/calls/${currentCall._id}`, { method: 'DELETE' });
        }
        setCallStatus('idle');
        setCurrentCall(null);
        onClose();
    };

    const cleanup = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }
        if (peerConnection.current) {
            peerConnection.current.close();
        }
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '20px',
                textAlign: 'center',
                minWidth: '350px'
            }}>
                {callStatus === 'idle' && (
                    <>
                        <h2>📞 {targetUser.username}님에게 전화</h2>
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={handleCall} style={{ backgroundColor: '#48bb78', padding: '1rem 2rem' }}>
                                📞 전화 걸기
                            </button>
                            <button onClick={onClose} style={{ backgroundColor: '#f56565', padding: '1rem 2rem' }}>
                                취소
                            </button>
                        </div>
                    </>
                )}

                {callStatus === 'calling' && (
                    <>
                        <h2>📞 전화 거는 중...</h2>
                        <p>{targetUser.username}님이 응답을 기다리고 있습니다.</p>
                        <button onClick={handleHangup} style={{ backgroundColor: '#f56565', marginTop: '2rem', padding: '1rem 2rem' }}>
                            끊기
                        </button>
                    </>
                )}

                {callStatus === 'ringing' && currentCall && (
                    <>
                        <h2>📞 {currentCall.from}님의 전화</h2>
                        <p>전화가 왔습니다!</p>
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={handleAnswer} style={{ backgroundColor: '#48bb78', padding: '1rem 2rem' }}>
                                ✅ 받기
                            </button>
                            <button onClick={handleDecline} style={{ backgroundColor: '#f56565', padding: '1rem 2rem' }}>
                                ❌ 거절
                            </button>
                        </div>
                    </>
                )}

                {callStatus === 'connected' && (
                    <>
                        <h2>📞 통화 중</h2>
                        <p style={{ fontSize: '3rem', margin: '2rem 0' }}>🔊</p>
                        <p>{targetUser?.username || currentCall?.from}님과 통화 중입니다.</p>
                        <button onClick={handleHangup} style={{ backgroundColor: '#f56565', marginTop: '2rem', padding: '1rem 2rem' }}>
                            📞 끊기
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VoiceCall;
