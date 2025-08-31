import {TextInput, useWindowDimensions, Text, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback} from "react-native";
import {useState} from 'react';
import { colors, fonts } from '../constants';
//icons
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Fontisto from '@expo/vector-icons/Fontisto';

export const Radio = ({options, checkedValue, onChange, disabled = false}) => {
    return (
        <View>
            {options.map((option) => {
                const active = checkedValue === option.value;
                return (
                    <TouchableOpacity 
                        style={styles.optionContainer} 
                        onPress={() => !disabled && onChange(option.value)}
                        key={option.value}
                        disabled={disabled}
                    >
                        <Fontisto 
                            name={active ? "radio-btn-active" : "radio-btn-passive"} 
                            size={20}
                            color={active ? colors.secondary : "#ccc"}
                        />
                        <Text style={styles.optionText}>{option.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};


const Report = ({ isVisible, onClose }) => {
    const {width, height} = useWindowDimensions();
    const [reportReason, setReportReason] = useState("");
    const [otherDetails, setOtherDetails] = useState("");
    
    if (!isVisible) return null;

    return (
        <TouchableWithoutFeedback onPress={onClose}>
            <View style={[styles.overlay,{ width:width, height:height}]}>
                <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                    <View style={[styles.reportContainer, { 
                        paddingHorizontal: width * 0.02, 
                        paddingVertical: height * 0.02 
                    }]}>
                        <MaterialIcons 
                            name="report-gmailerrorred" 
                            size={30} 
                            color={colors.iconColor} 
                            style={styles.reportIcon} 
                        />
                        <Text style={styles.reportTitle}>Report</Text>

                        <Radio 
                            options={[
                                {label: "Misleading and wrong information", value: "misleading"},
                                {label: "Inappropriate content", value: "inappropriate"},
                                {label: "Spam", value: "spam"},
                                {label: "Other", value: "other"},
                            ]}
                            checkedValue={reportReason}
                            onChange={setReportReason}
                        />

                        {reportReason === "other" && (
                            <TextInput
                                placeholder='Please Specify'
                                placeholderTextColor="grey"
                                style={styles.textInput}
                            onChangeText={setOtherDetails}/>
                        )}

                        <TouchableOpacity 
                            onPress={() => {
                                if (!reportReason ) {
                                    alert('Please select a report reason');
                                    return;
                                }else if(reportReason=== "other" && !otherDetails){
                                     alert('Please fill in the report reason');
                                    return;
                                }
                                console.log('Reported for:',reportReason==="other"? otherDetails:reportReason);
                                onClose();
                            }}
                            style={styles.submitButton}
                        >
                            <Text style={styles.submitText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        backgroundColor: "rgba(48, 48, 48, 0.54)",
        width: '100%',
        height: '100%',
        zIndex: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reportContainer: {
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: 11,
     
    },
    reportIcon: {
        alignSelf: 'center',
    
    },
    reportTitle: {
        alignSelf: 'center',
        fontFamily: fonts.initial,
        fontSize: 15,
        marginBottom: 15,
        color: colors.iconColor,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 3,
     
    },
    optionText: {
        fontFamily: fonts.initial,
        marginLeft: 7,
        fontSize: 11,
    },
    textInput: {
        borderWidth: 1,
        borderColor: "grey",
        borderRadius: 5,
        marginVertical: 9,
        fontFamily: fonts.initial,
        fontSize:11,
    },
    submitButton: {
        backgroundColor: colors.iconColor,
        margin: 3,
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        marginTop:13,
            },
    submitText: {
        color: 'white',
        fontFamily: fonts.initial,
        fontSize: 12,
         fontWeight:"bold",
    },
});

export default Report;