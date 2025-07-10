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
    const selectedOption = options.find(option => option.value === optionValue);
    if (selectedOption?.disabled || selectedOption?.divider) {
      return;
    }
    
    onValueChange(optionValue);
    setIsOpen(false);
  };
  return (
    <View className={cn("relative", className)}>
      <Pressable
        onPress={() => setIsOpen(true)}
        className="flex-row items-center justify-between bg-white border border-[#2A1800] rounded-md px-4 py-1.5"
      >       
        <Text 
          className={cn(
            "font-lato text-base flex-1 font-bold",
            selectedOption ? "text-gray-800" : "text-gray-500"
          )}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <MaterialIcons 
          name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
          size={18} 
          color="#AC6924" 
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
          onPress={() => setIsOpen(false)}        >
          <View className="bg-white rounded-xl shadow-lg max-h-64 w-2/3 max-w-sm border overflow-hidden py-2">
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                if (item.divider) {
                  return <View className="h-px bg-amber-700/10 my-1" />;  }
                return (
                  <Pressable
                    onPress={() => handleSelect(item.value)}
                    className={cn("px-4 py-2 mx-2 my-1 rounded-md",
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
                          color={value === item.value ? "#AC6924" : "#666"}
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text className={cn(
                        "text-base font-lato", 
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
