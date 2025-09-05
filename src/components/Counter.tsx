import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { StorageService } from '../services/storage';
import { COLORS } from '../utils/constants';

export const Counter: React.FC = () => {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const scaleAnim = new Animated.Value(1);
  const storage = StorageService.getInstance();

  useEffect(() => {
    loadInitialCount();
  }, []);

  const loadInitialCount = async () => {
    try {
      const savedCount = await storage.getCounterValue();
      setCount(savedCount);
    } catch (error) {
      Alert.alert('Error', 'Failed to load counter value');
    } finally {
      setIsLoading(false);
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const incrementCounter = async () => {
    animateButton();
    const newCount = count + 1;
    setCount(newCount);
    await storage.saveCounterValue(newCount);
  };

  const decrementCounter = async () => {
    animateButton();
    const newCount = Math.max(0, count - 1);
    setCount(newCount);
    await storage.saveCounterValue(newCount);
  };

  const resetCounter = async () => {
    Alert.alert(
      'Reset Counter',
      'Are you sure you want to reset the counter to 0?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setCount(0);
            await storage.saveCounterValue(0);
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Counter Widget App</Text>
      
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>{count}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.button, styles.decrementButton]}
            onPress={decrementCounter}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.button, styles.incrementButton]}
            onPress={incrementCounter}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={resetCounter}
        activeOpacity={0.8}
      >
        <Text style={styles.resetButtonText}>Reset</Text>
      </TouchableOpacity>

      <Text style={styles.infoText}>
        This counter syncs with your home screen widgets!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 40,
    textAlign: 'center',
  },
  counterContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  counterText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    minWidth: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 300,
    marginBottom: 30,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  incrementButton: {
    backgroundColor: COLORS.success,
  },
  decrementButton: {
    backgroundColor: COLORS.danger,
  },
  buttonText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  resetButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.text,
  },
});
