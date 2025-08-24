import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Home() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const addIngredient = () => {
    const trimmed = input.trim();
    if (trimmed !== '' && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setInput('');
    }
  };

  const removeIngredient = (item: string) => {
    setIngredients(ingredients.filter((i) => i !== item));
  };

  const generateSuggestions = () => {
    if (ingredients.length === 0) return;

    //  change api later 
  
    const newSuggestions = ingredients.map((ing, index) => `Recipe with ${ing}`);
    setSuggestions(newSuggestions);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Search + Add */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Enter ingredient..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
          <Text style={styles.addText}>ADD</Text>
        </TouchableOpacity>
      </View>

      {/* Ingredients */}
      <Text style={styles.sectionTitle}>Ingredients</Text>
      <View style={styles.ingredientBox}>
        {ingredients.map((item, index) => (
          <View key={index} style={styles.ingredientChip}>
            <Text style={styles.chipText}>{item}</Text>
            <TouchableOpacity onPress={() => removeIngredient(item)}>
              <Ionicons name="close-circle" size={18} color="white" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.searchButton} onPress={generateSuggestions}>
          <Ionicons name="search" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Suggestions */}
      <Text style={styles.sectionTitle}>Recipe Suggestions</Text>
      <View style={styles.suggestionBox}>
        {suggestions.length === 0 ? (
          <Text style={{ color: 'gray' }}>No suggestions yet. Add ingredients & press search.</Text>
        ) : (
          suggestions.map((s, i) => (
            <TouchableOpacity key={i} style={styles.suggestion}>
              <Text style={styles.suggestionText}>{s}</Text>
              <Ionicons name="play-circle" size={24} color="white" />
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'green',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    marginLeft: 8,
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  ingredientBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'green',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: 'white',
    fontWeight: '500',
    marginRight: 5,
  },
  searchButton: {
    marginLeft: 'auto',
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 50,
  },
  suggestionBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  suggestionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});


