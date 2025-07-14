import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function DMTrackerScreen({ navigation }) {

  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [dms, setDMs] = useState([]);
  const [filter, setFilter] = useState('All');
  const [editingDM, setEditingDM] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [platform, setPlatform] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSendToList, setShowSendToList] = useState(false);
  const [showForm, setShowForm] = useState(false);






  const handleSubmit = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!name || !status || !user) {
    Alert.alert('Validation Error', 'Name and status are required');
    return;
  }

  const dmData = {
  name: name.trim(),
  status: status.trim().toLowerCase(),
  platform: platform.trim(),
  notes: notes.trim(),
  user_id: user.id,
 };


  let error;
  if (editingDM) {
    ({ error } = await supabase.from('dms').update(dmData).eq('id', editingDM.id));
  } else {
    ({ error } = await supabase.from('dms').insert([dmData]));
  }

  if (error) {
    Alert.alert('Save Failed', error.message);
  } else {
    setName('');
    setStatus('');
    setPlatform('');
    setNotes('');
    setEditingDM(null);
    fetchDMs();
  }
 };






  const fetchDMs = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("✅ Logged-in Supabase User ID:", user.id);

    if (!user) return;

    const { data, error } = await supabase
      .from('dms')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) Alert.alert('Error loading DMs', error.message);
    else setDMs(data);
  };

  const deleteDM = async (id) => {
  console.log('Trying to delete ID:', id);

  const { error } = await supabase
    .from('dms')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("❌ Delete Failed:", error.message);
    Alert.alert('Delete Failed', error.message);
  } else {
    console.log("✅ Deleted successfully");
    fetchDMs();
  }
 };
 const sendTemplateToDM = async (id) => {
  const { error } = await supabase
    .from('dms')
    .update({ notes: selectedTemplate })
    .eq('id', id);

  if (error) {
    Alert.alert('Send Failed', error.message);
  } else {
    fetchDMs(); // refresh the list
    Alert.alert('Sent!', 'Template sent successfully.');
    setShowSendToList(false);  // close the modal
    setShowTemplates(false);   // close the template modal too
  }
 };









  const openEditModal = (dm) => {
  setEditingDM(dm);
  setName(dm.name);
  setStatus(dm.status);
  setPlatform(dm.platform || '');
  setNotes(dm.notes || '');
 };


  const handleEditSave = async () => {
  if (!name || !status) {
    Alert.alert('Validation Error', 'Name and status are required');
    return;
  }

  const { error } = await supabase
    .from('dms')
    .update({
      name: name.trim(),
      status: status.trim().toLowerCase(),
      platform: platform.trim(),
      notes: notes.trim(),
    })
    .eq('id', editingDM.id);

  if (error) {
    Alert.alert('Update Failed', error.message);
  } else {
    setEditingDM(null);
    setName('');
    setStatus('');
    setPlatform('');
    setNotes('');
    fetchDMs();
  }
 };


 useEffect(() => {
  const logCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("Current user ID:", user.id);
  };
  logCurrentUser();
 }, []);

  useEffect(() => {
    fetchDMs();
  }, []);

  useEffect(() => {
  const checkSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigation.replace('Login');
    }
  };
  checkSession();
 }, []);


 const statusCounts = dms.reduce((acc, dm) => {
  const key = dm.status.toLowerCase();
  acc[key] = (acc[key] || 0) + 1;
  return acc;
 }, {});

  const filteredDMs = dms.filter((dm) => {
  const matchesStatus = filter === 'All' || dm.status.toLowerCase() === filter.toLowerCase();
  const matchesSearch = dm.name.toLowerCase().includes(searchQuery.toLowerCase());
  return matchesStatus && matchesSearch;
 });
  const groupedDMs = filteredDMs.reduce((acc, dm) => {
  const platformKey = dm.platform || 'Other';
  if (!acc[platformKey]) acc[platformKey] = [];
  acc[platformKey].push(dm);
  return acc;
 }, {});




  return (  <View style={styles.container}>
      <Text style={styles.header}>DM Tracker</Text>
      <TouchableOpacity onPress={() => setShowTemplates(true)} style={styles.templateHeaderButton}>
      <Text style={styles.templateHeaderText}>📋 Templates</Text>
      </TouchableOpacity>

      {!showForm && (
      <TouchableOpacity onPress={() => setShowForm(true)} style={styles.newDmButton}>
       <Text style={styles.newDmButtonText}>➕ New DM</Text>
      </TouchableOpacity>
     )}

     



      {showForm && (
  <View style={{ marginTop: 16, marginBottom: 24 }}>
    <TextInput
      placeholder="Name"
      style={styles.input}
      value={name}
      onChangeText={setName}
    />

    <TextInput
      placeholder="Status"
      style={styles.input}
      value={status}
      onChangeText={setStatus}
    />

    <TextInput
      placeholder="Platform (e.g. Instagram)"
      style={styles.input}
      value={platform}
      onChangeText={setPlatform}
    />

    <TextInput
      placeholder="Notes"
      style={[styles.input, { height: 80 }]}
      value={notes}
      onChangeText={setNotes}
      multiline
    />

    <View style={{ marginTop: 12 }}>
      <Button title="SAVE DM" onPress={handleSubmit} />
    </View>

    <View style={{ marginTop: 8 }}>
      <Button
        title="CANCEL"
        color="#999"
        onPress={() => setShowForm(false)}
      />
    </View>
  </View>
 )}
       <Text style={styles.subheader}>Your Saved DMs:</Text>

       <TextInput
       placeholder="Search by name..."
       style={styles.input}
       value={searchQuery}
       onChangeText={setSearchQuery}
       />

      <View style={styles.filterRow}>
        {['All', 'new lead', 'interested', 'warm lead', 'sent invoice', 'closed'].map((s) => (
          <TouchableOpacity key={s} onPress={() => setFilter(s)}>
            <Text style={[styles.filterButton, filter === s && styles.activeFilter]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.summary}>
       Summary:{" "}
       {Object.entries(statusCounts)
       .map(([status, count]) => `${count} ${status}`)
       .join(", ")}
      </Text>

      {Object.entries(groupedDMs).map(([platformName, dmList]) => (
      <View key={platformName} style={{ marginBottom: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
      {platformName}
       </Text>
       {dmList.map((item) => (
      <View key={item.id} style={styles.card}>
        <Text style={styles.dmName}>{item.name}</Text>
        <Text style={styles.dmStatus}>{item.status}</Text>
        {item.notes ? <Text>Notes: {item.notes}</Text> : null}
        <Text style={{ fontSize: 12, color: '#888' }}>
          Created: {new Date(item.created_at).toLocaleString()}
        </Text>
        <Text style={{ fontSize: 12, color: '#aaa' }}>
          Updated: {new Date(item.updated_at).toLocaleString()}
        </Text>

        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => openEditModal(item)}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteDM(item.id)}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    ))}
  </View>
 ))}




      <Modal visible={!!editingDM} animationType="slide" transparent>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text>Edit DM</Text>
      <TextInput
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Status"
        style={styles.input}
        value={status}
        onChangeText={setStatus}
        
      />
      <TextInput
        placeholder="Platform"
        style={styles.input}
        value={platform}
        onChangeText={setPlatform}
      />
      <TextInput
        placeholder="Notes"
        style={[styles.input, { height: 80 }]}
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <Button title="Save Changes" onPress={handleEditSave} />
      <Button title="Cancel" color="#999" onPress={() => setEditingDM(null)} />
    </View>
  </View>
  </Modal>
  <Modal visible={showTemplates} transparent animationType="slide">
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.subheader}>Insert Message Template</Text>

      <TouchableOpacity onPress={() => {
       setSelectedTemplate(templates.intro);      // Save the selected message
       setShowSendToList(true);                   // Show the "Send To" list
      }}>
        <Text style={styles.templateButton}>Send Intro To...</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => {
       setSelectedTemplate(templates.followUp);
       setShowSendToList(true);
      }}>
       <Text style={styles.templateButton}>Send Follow-Up To...</Text>
      </TouchableOpacity>

       <TouchableOpacity onPress={() => {
        setSelectedTemplate(templates.closing);
        setShowSendToList(true);
      }}>
       <Text style={styles.templateButton}>Send Closing To...</Text>
      </TouchableOpacity>


      <Button title="Close" onPress={() => setShowTemplates(false)} />
        <Modal visible={showSendToList} transparent animationType="slide">
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalHeader}>Select a DM to Send Template</Text>
      <FlatList
        data={dms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.dmListItem}
            onPress={() => {
              console.log(`📤 Sending "${selectedTemplate}" to ${item.name}`);
              setShowSendToList(false);
              setShowTemplates(false);
            }}
          >
            <Text style={styles.dmName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <Button title="Cancel" onPress={() => setShowSendToList(false)} />
    </View>
  </View>
 </Modal>

    </View>
  </View>
  </Modal>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dmName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dmStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  deleteText: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    justifyContent: 'center',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ddd',
    borderRadius: 20,
    margin: 5,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#333',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  summary: {
   fontSize: 14,
   marginBottom: 10,
   textAlign: 'center',
   color: '#555',
  },
   templateHeaderButton: {
   alignSelf: 'center',
   marginBottom: 10,
   backgroundColor: '#ddd',
   paddingVertical: 6,
   paddingHorizontal: 14,
   borderRadius: 10,
  },

   templateHeaderText: {
   fontSize: 14,
   fontWeight: 'bold',
   color: '#333',
   },

   modalContainer: {
   flex: 1,
   backgroundColor: 'rgba(0,0,0,0.3)',
   justifyContent: 'center',
   padding: 20,
  },
   modalContent: {
   backgroundColor: '#fff',
   padding: 20,
   borderRadius: 10,
   maxHeight: '80%',
  },
   modalHeader: {
   fontSize: 18,
   fontWeight: 'bold',
   marginBottom: 10,
   textAlign: 'center',
  },
   dmListItem: {
   paddingVertical: 12,
   borderBottomWidth: 1,
   borderColor: '#eee',
  },
   templateButton: {
   paddingVertical: 10,
   paddingHorizontal: 14,
   marginVertical: 5,
   backgroundColor: '#eee',
   borderRadius: 8,
   textAlign: 'center',
   fontWeight: '600',
  },
   newDmButton: {
   marginTop: 16,
   alignSelf: 'center',
   paddingVertical: 10,
   paddingHorizontal: 20,
   backgroundColor: '#eee',
   borderRadius: 10,
  },
   newDmButtonText: {
   fontSize: 16,
  },






 });


