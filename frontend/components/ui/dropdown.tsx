import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { cn } from '~/lib/utils';

interface DropdownOption {
  label: string;
  value: string;
  divider?: boolean;
  disabled?: boolean;
  icon?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: string;
}

export function Dropdown({ options, value, onValueChange, placeholder = "Select option", className, icon }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    // Check if the option is disabled or a divider
    const selectedOption = options.find(option => option.value === optionValue);
    if (selectedOption?.disabled || selectedOption?.divider) {
      return;
    }
    
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View className={cn("relative", className)}>      <Pressable
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between bg-white border border-amber-700/30 rounded-full px-3 py-1.5"
      >
        {icon && (
          <MaterialIcons 
            name={icon as any} 
            size={16} 
            color="#9A6C39"
            style={{ marginRight: 8 }} 
          />
        )}
        <Text className={cn(
          "text-sm flex-1",
          selectedOption ? "text-gray-800" : "text-gray-500"
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <MaterialIcons 
          name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
          size={18} 
          color="#9A6C39" 
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setIsOpen(false)}
        >
          <View className="bg-white rounded-xl shadow-lg max-h-64 w-4/5 max-w-sm border border-amber-700/20 overflow-hidden">            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                if (item.divider) {
                  return <View className="h-px bg-amber-700/10 my-1" />;
                }
                
                return (
                  <Pressable
                    onPress={() => handleSelect(item.value)}
                    className={cn(                      "px-4 py-2 border-b border-amber-700/10 last:border-b-0",
                      item.disabled && "opacity-50",
                      value === item.value && "bg-amber-50"
                    )}
                    disabled={item.disabled}
                  >
                    <View className="flex-row items-center">
                      {item.icon && (
                        <MaterialIcons 
                          name={item.icon as any} 
                          size={18} 
                          color={value === item.value ? "#9A6C39" : "#666"}
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text className={cn(                        "text-sm",
                        value === item.value ? "text-amber-800 font-medium" : "text-gray-800",
                        item.disabled && "text-gray-400"
                      )}>
                        {item.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
