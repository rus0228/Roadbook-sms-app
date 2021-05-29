import React, {useEffect, useState} from 'react';
import BackgroundTimer from 'react-native-background-timer';
import SmsAndroid from 'react-native-get-sms-android';
import {FlatList, Text, View, Button, StyleSheet} from 'react-native';

const api_url = 'http://localhost/checkmsg.php?';
let preSeconds = 0;
let smsText = null;
let smsNumber = 0;
let updateFlatList = 0;
let flatListData = [];

const updateFlatListData = (status) => {
    updateFlatList += 1;
    flatListData.unshift({
        id: updateFlatList,
        text: status ? `sms sent success ${new Date().toLocaleTimeString()}` : `sms sent failed  ${new Date().toLocaleTimeString()}`,
        status: status
    });
    if (flatListData.length > 10){
        flatListData.pop();
    }
};

const App = () => {
    const [currentSeconds, setCurrentSeconds] = useState(0);
    const [currentMilliseconds, setCurrentMilliseconds] = useState(0);
    const [timer, setTimer] = useState(false);
    /**
     * When timer is changed, this function is started,
     * which starts and stops background timer.
     **/
    useEffect(() => {
        if (timer) {
            startTimer();
        } else {
            BackgroundTimer.stopBackgroundTimer();
        }
        return () => {
            BackgroundTimer.stopBackgroundTimer();
        };
    }, []);

    const sendSms = (data) => {
        console.log('Function sendSms start---------');
        console.log(data.phoneNumber);
        console.log(data.smsText);
        if (data.phoneNumber > 10000000){
            console.log('Now I have to send SMS.');
            SmsAndroid.autoSend(
                data.phoneNumber,
                data.smsText,
                (fail) => {
                    console.log('Failed with this error: ' + fail);
                    updateFlatListData(false);
                }, (success) => {
                    updateFlatListData(true);
                }
            );
        }
        console.log('Function sendSms end------------');
    };


    const startTimer = () => {
        BackgroundTimer.runBackgroundTimer(() => {
            setCurrentSeconds(new Date().getSeconds());
            if (currentSeconds !== preSeconds) {
                preSeconds = currentSeconds;

                // Send GET to server og get reply - start
                let sendtStatus = 'wait';
                let name = `Peddern${updateFlatList}`;
                let phoneNumber = 10000000 + updateFlatList;
                smsText = '';
                smsNumber = 0;
                axios
                    .get(`${api_url}sendtStatus=${sendtStatus}`)
                    .then(function (res) {
                        console.log(
                            `Id: ${res.data.id}`,
                            `Msg: ${res.data.message}`,
                            `Tlf: ${res.data.phoneNumber}`,
                            `Meld: ${res.data.msgText}`,
                        );
                        sendSms(res.data);
                    })
                    .catch(function (err) {
                        console.log(`Error: ${err}`);
                    });
            }
        }, 5000);
    };

    return (
        <View style={styles.container}>
            <Text>Current Second: {currentSeconds}</Text>
            <Text>Current Milli seconds {currentMilliseconds}</Text>
            <Button
                title="Start/Stop"
                onPress={setTimer(timer => !timer)}
            />
            <FlatList
                data={flatListData}
                renderItem={({item}) => <Text>{item.id} - {item.text}</Text>}
                extraData={updateFlatList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 10,
    }
});

export default App;
