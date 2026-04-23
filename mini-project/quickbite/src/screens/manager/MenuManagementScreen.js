import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import colors from "../../styles/colors";
import typography from "../../styles/typography";
import { apiFetch } from "../../services/api";

function formatMoney(value) {
  return `₹${Number(value || 0).toFixed(0)}`;
}

export default function MenuManagementScreen({ route, navigation }) {
  const { stallId, stallName } = route.params || {};

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add/Edit Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "main",
    is_available: true,
    veg_nonveg: "veg",
  });
  const [saving, setSaving] = useState(false);

  const loadMenu = useCallback(async () => {
    setError("");
    try {
      const res = await apiFetch(`/menu/${stallId}`);
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed");
      setItems(Array.isArray(json.items) ? json.items : []);
    } catch {
      setError("Could not load menu items.");
    }
  }, [stallId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadMenu();
      setLoading(false);
    })();
  }, [loadMenu]);

  const openForm = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setForm({
        name: item.name || "",
        price: String(item.price || ""),
        category: item.category || "main",
        is_available: !!item.is_available,
        veg_nonveg: item.veg_nonveg || "veg",
      });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        price: "",
        category: "main",
        is_available: true,
        veg_nonveg: "veg",
      });
    }
    setModalVisible(true);
  };

  const closeForm = () => setModalVisible(false);

  const handleSave = async () => {
    const { name, price, category, is_available, veg_nonveg } = form;
    if (!name.trim() || !price.trim()) {
      Alert.alert("Required", "Name and price are required.");
      return;
    }

    setSaving(true);
    try {
      const endpoint = editingId ? `/menu/${editingId}` : `/menu`;
      const method = editingId ? "PUT" : "POST";

      const payload = {
        stallId,
        name: name.trim(),
        price: Number(price),
        category,
        is_available,
        veg_nonveg,
      };

      const res = await apiFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Failed");

      closeForm();
      await loadMenu();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await apiFetch(`/menu/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || "Failed");
            await loadMenu();
          } catch (e) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  const toggleAvailability = async (id, currentVal) => {
    try {
      await apiFetch(`/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: !currentVal }),
      });
      await loadMenu();
    } catch {
      // ignore silently for optimistic toggles
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Menu Management</Text>
            <Text style={styles.subTitle}>{stallName}</Text>
          </View>
        </View>
        <Pressable onPress={() => openForm()} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add Item</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {items.map((it) => (
            <View key={String(it.id)} style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{it.name}</Text>
                  <Text style={styles.itemMeta}>
                    {formatMoney(it.price)} • {it.category} • {it.veg_nonveg}
                  </Text>
                </View>
                <View style={styles.toggleWrap}>
                  <Text style={styles.toggleLabel}>Available</Text>
                  <Switch
                    value={!!it.is_available}
                    onValueChange={() =>
                      toggleAvailability(it.id, it.is_available)
                    }
                    trackColor={{ true: colors.success, false: colors.gray4 }}
                  />
                </View>
              </View>

              <View style={styles.cardActions}>
                <Pressable onPress={() => openForm(it)} style={styles.editBtn}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(it.id)}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingId ? "Edit Item" : "New Item"}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price (₹)</Text>
              <TextInput
                style={styles.input}
                value={form.price}
                onChangeText={(v) => setForm({ ...form, price: v })}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.rowGroup}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerWrap}>
                  <Picker
                    selectedValue={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <Picker.Item label="Main" value="main" />
                    <Picker.Item label="Side" value="side" />
                    <Picker.Item label="Drink" value="drink" />
                  </Picker>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.pickerWrap}>
                  <Picker
                    selectedValue={form.veg_nonveg}
                    onValueChange={(v) => setForm({ ...form, veg_nonveg: v })}
                  >
                    <Picker.Item label="Veg" value="veg" />
                    <Picker.Item label="Non-Veg" value="nonveg" />
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.switchGroup}>
              <Text style={styles.label}>Currently Available</Text>
              <Switch
                value={form.is_available}
                onValueChange={(v) => setForm({ ...form, is_available: v })}
                trackColor={{ true: colors.success }}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={closeForm}
                style={styles.modalCancelBtn}
                disabled={saving}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                style={styles.modalSaveBtn}
                disabled={saving}
              >
                <Text style={styles.modalSaveText}>
                  {saving ? "Saving..." : "Save Item"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray5 },
  header: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray5,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray5,
    marginRight: 12,
  },
  backText: { ...typography.h3, color: colors.gray1 },
  title: { ...typography.h2, color: colors.gray1 },
  subTitle: { ...typography.caption, color: colors.gray2, marginTop: 2 },
  addBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  addBtnText: { ...typography.button, color: colors.white },
  scroll: { padding: 16, paddingBottom: 30 },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: colors.error, marginBottom: 10 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between" },
  itemName: { ...typography.h3, color: colors.gray1 },
  itemMeta: {
    ...typography.caption,
    color: colors.gray2,
    marginTop: 4,
    textTransform: "capitalize",
  },
  toggleWrap: { alignItems: "center" },
  toggleLabel: { ...typography.caption, color: colors.gray2, marginBottom: 4 },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray5,
    paddingTop: 12,
    gap: 12,
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.gray5,
  },
  editBtnText: { ...typography.bodyMedium, color: colors.gray1 },
  deleteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteBtnText: { ...typography.bodyMedium, color: colors.error },

  // Modal
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: { backgroundColor: colors.white, borderRadius: 12, padding: 20 },
  modalTitle: { ...typography.h2, color: colors.gray1, marginBottom: 20 },
  inputGroup: { marginBottom: 14 },
  rowGroup: { flexDirection: "row", marginBottom: 14 },
  label: { ...typography.caption, color: colors.gray2, marginBottom: 6 },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray4,
    paddingHorizontal: 12,
    ...typography.body,
    color: colors.gray1,
  },
  pickerWrap: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray4,
    overflow: "hidden",
    justifyContent: "center",
  },
  switchGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 10,
  },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  modalCancelText: { ...typography.button, color: colors.gray2 },
  modalSaveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalSaveText: { ...typography.button, color: colors.white },
});
