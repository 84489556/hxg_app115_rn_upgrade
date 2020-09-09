import React, { Component } from 'react';
import { Image, ListView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Picker from 'react-native-picker';
export function showPicker(alldate, selecteddate, callback, cancelback) {

    Picker.init(
        {
            pickerCancelBtnText: '取消',
            pickerConfirmBtnText: '确定',
            pickerTitleText: '时间选择',
            pickerCancelBtnColor: [31, 143, 229, 1],
            pickerConfirmBtnColor: [31, 143, 229, 1],
            pickerToolBarBg: [254, 254, 254, 1],
            pickerBg: [255, 255, 255, 1],
            pickerFontSize: 20,
            pickerData: alldate,
            selectedValue: selecteddate,
            onPickerConfirm: data => {
                callback && callback(data)
            },
            onPickerCancel: () => {
                cancelback && cancelback();
            },
        });
    Picker.show();

}

export function hidePicker() {
    Picker.isPickerShow(status => {
        Picker.hide();
    })
}

