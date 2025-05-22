import { Modal, View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type TaskCardProps = {
  visible: boolean;
  onClose: () => void;
  task: {
    title: string;
    purpose?: string;
    image?: string;
    dosageStrength?: string;
    howToTake?: string;
    instructions?: string[];
    startDate?: string;
    endDate?: string;
    importantNotes?: string[];
    contactNumber?: string;
  } | null;
};

const TaskCard = ({ visible, onClose, task }: TaskCardProps) => {
  if (!task) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose}>
              <MaterialIcons name="arrow-back" size={24} color="#000" />
            </Pressable>
            <View style={styles.titleContainer}>
              <MaterialIcons name="medication" size={24} color="#666" />
              <Text style={styles.title}>{task.title}</Text>
            </View>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#000" />
            </Pressable>
          </View>

          {/* Purpose */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Purpose of medication</Text>
            <Text style={styles.sectionText}>{task.purpose}</Text>
          </View>

          {/* Medication Image */}
          {task.image && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: task.image }} style={styles.image} />
            </View>
          )}

          {/* Dosage and How to Take */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Dosage Strength</Text>
              <Text style={styles.infoValue}>{task.dosageStrength}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>How to take</Text>
              <Text style={styles.infoValue}>{task.howToTake}</Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {task.instructions?.map((instruction, index) => (
              <Text key={index} style={styles.instruction}>{instruction}</Text>
            ))}
          </View>

          {/* Start and End Dates */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Start</Text>
              <Text style={styles.infoValue}>{task.startDate}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>End</Text>
              <Text style={styles.infoValue}>{task.endDate}</Text>
            </View>
          </View>

          {/* Important Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Important Notes</Text>
            {task.importantNotes?.map((note, index) => (
              <Text key={index} style={styles.note}>• {note}</Text>
            ))}
          </View>

          {/* Contact Information */}
          {task.contactNumber && (
            <Text style={styles.contact}>
              Contact doctor at {task.contactNumber} if you experience severe side effects.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
  },
  imageContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  instruction: {
    fontSize: 14,
    marginBottom: 4,
  },
  note: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  contact: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
  },
});

export default TaskCard;