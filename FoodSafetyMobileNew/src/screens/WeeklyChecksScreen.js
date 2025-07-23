import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { recordsAPI } from '../services/api';

const WeeklyChecksScreen = ({ navigation }) => {
  const [weekCommencing, setWeekCommencing] = useState('');
  const [checklistData, setChecklistData] = useState({});
  const [correctiveActions, setCorrectiveActions] = useState([
    { deviation: '', action: '' },
    { deviation: '', action: '' },
    { deviation: '', action: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [managerSignature, setManagerSignature] = useState('');
  const [signatureDate, setSignatureDate] = useState('');
  const [loading, setLoading] = useState(false);

  const checklistSections = [
    {
      title: "Training",
      question: "Have the Training House Rules been followed?",
      items: [
        "New Staff including Induction",
        "Formal Training", 
        "Retraining/HACCP Training",
        "Other Training"
      ]
    },
    {
      title: "Personal Hygiene",
      question: "Have the Personal Hygiene House Rules been followed?",
      items: [
        "Personal Cleanliness/Hand Washing Facilities",
        "Protective Clothing",
        "Illness/Exclusion"
      ]
    },
    {
      title: "Cleaning",
      question: "Has the Cleaning Schedule been followed?",
      items: [
        "All specified equipment and areas",
        "Frequency",
        "Method"
      ]
    },
    {
      title: "Cross Contamination Prevention",
      question: "Have the Cross Contamination Prevention House Rules been followed?",
      items: [
        "Personnel",
        "Delivery Vehicles",
        "Storage",
        "Cooling",
        "Equipment",
        "Allergy Awareness"
      ]
    },
    {
      title: "Pest Control",
      question: "Have the Pest Control House Rules been followed?",
      items: [
        "Pest Proofing",
        "Good Housekeeping"
      ]
    },
    {
      title: "Waste Control",
      question: "Have the Waste Control House Rules been followed?",
      items: [
        "Waste in Food Rooms",
        "Waste Collection"
      ]
    },
    {
      title: "Maintenance",
      question: "Have the Maintenance House Rules been followed?",
      items: [
        "Delivery Vehicles",
        "Premises Structure",
        "Light Fittings/Covers",
        "Work Surfaces",
        "Equipment/Utensils",
        "Ventilation System"
      ]
    },
    {
      title: "Stock Control",
      question: "Have the Stock Control House Rules been followed?",
      items: [
        "Delivery",
        "Storage",
        "Stock Rotation",
        "Labelling",
        "Protection of Food"
      ]
    },
    {
      title: "Temperature Control",
      question: "Have the Temperature Control House Rules been followed?",
      items: []
    },
    {
      title: "Records",
      question: "Have all necessary Temperature Checks been recorded using the correct recording forms?",
      items: []
    }
  ];

  const handleOptionSelect = (sectionIndex, itemIndex, value) => {
    const key = `${sectionIndex}-${itemIndex}`;
    setChecklistData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCorrectiveActionChange = (index, field, value) => {
    const newActions = [...correctiveActions];
    newActions[index][field] = value;
    setCorrectiveActions(newActions);
  };

  const addCorrectiveAction = () => {
    setCorrectiveActions([...correctiveActions, { deviation: '', action: '' }]);
  };

  const handleSubmit = async () => {
    if (!weekCommencing || !managerSignature || !signatureDate) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        weekCommencing,
        checklistData,
        correctiveActions: correctiveActions.filter(action => 
          action.deviation.trim() || action.action.trim()
        ),
        notes,
        managerSignature,
        signatureDate
      };

      await recordsAPI.createWeeklyRecord(submitData);
      Alert.alert(
        'Success', 
        'Weekly Record submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting weekly record:', error);
      Alert.alert(
        'Error',
        error.response?.data?.msg || 'Failed to submit weekly record. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderOptionButtons = (sectionIndex, itemIndex, selectedValue) => {
    const options = ['yes', 'no', 'na'];
    const optionLabels = { yes: 'Yes', no: 'No', na: 'N/A' };
    const optionColors = { 
      yes: '#4caf50', 
      no: '#f44336', 
      na: '#ff9800' 
    };

    return (
      <View style={styles.optionContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selectedValue === option && { 
                backgroundColor: optionColors[option],
                borderColor: optionColors[option]
              }
            ]}
            onPress={() => handleOptionSelect(sectionIndex, itemIndex, option)}
          >
            <Text style={[
              styles.optionButtonText,
              selectedValue === option && styles.optionButtonTextSelected
            ]}>
              {optionLabels[option]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSection = (section, sectionIndex) => {
    return (
      <View key={sectionIndex} style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionQuestion}>{section.question}</Text>
        
        {section.items.length > 0 ? (
          section.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.itemContainer}>
              <Text style={styles.itemText}>• {item}</Text>
              {renderOptionButtons(sectionIndex, itemIndex, checklistData[`${sectionIndex}-${itemIndex}`])}
            </View>
          ))
        ) : (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>Overall compliance</Text>
            {renderOptionButtons(sectionIndex, 'main', checklistData[`${sectionIndex}-main`])}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1976d2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Checks</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Icon name="info" size={20} color="#2196f3" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            The following ongoing checks should be carried out by the Manager/Supervisor at the end of each working week
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Week Commencing *</Text>
          <TextInput
            style={styles.dateInput}
            value={weekCommencing}
            onChangeText={setWeekCommencing}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
          />
        </View>

        {checklistSections.map((section, index) => renderSection(section, index))}

        <View style={styles.correctiveActionsSection}>
          <Text style={styles.sectionTitle}>Corrective Actions</Text>
          {correctiveActions.map((action, index) => (
            <View key={index} style={styles.correctiveActionContainer}>
              <Text style={styles.inputLabel}>Deviation Observed</Text>
              <TextInput
                style={styles.textArea}
                value={action.deviation}
                onChangeText={(text) => handleCorrectiveActionChange(index, 'deviation', text)}
                placeholder="Describe any deviation observed"
                placeholderTextColor="#999"
                multiline
              />
              <Text style={styles.inputLabel}>Action Taken</Text>
              <TextInput
                style={styles.textArea}
                value={action.action}
                onChangeText={(text) => handleCorrectiveActionChange(index, 'action', text)}
                placeholder="Describe action taken"
                placeholderTextColor="#999"
                multiline
              />
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addCorrectiveAction}>
            <Icon name="add" size={20} color="#1976d2" />
            <Text style={styles.addButtonText}>Add Corrective Action</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Notes</Text>
          <TextInput
            style={styles.textArea}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes..."
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signatureRow}>
            <View style={styles.signatureField}>
              <Text style={styles.inputLabel}>Manager/Supervisor Signature *</Text>
              <TextInput
                style={styles.input}
                value={managerSignature}
                onChangeText={setManagerSignature}
                placeholder="Enter your name"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.signatureField}>
              <Text style={styles.inputLabel}>Date *</Text>
              <TextInput
                style={styles.input}
                value={signatureDate}
                onChangeText={setSignatureDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Weekly Record</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#000',
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  sectionQuestion: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    fontWeight: '500',
  },
  itemContainer: {
    marginBottom: 15,
  },
  itemText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  correctiveActionsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  correctiveActionContainer: {
    marginBottom: 20,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#1976d2',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  addButtonText: {
    color: '#1976d2',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#000',
  },
  signatureSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signatureRow: {
    flexDirection: 'row',
    gap: 15,
  },
  signatureField: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#1976d2',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WeeklyChecksScreen; 