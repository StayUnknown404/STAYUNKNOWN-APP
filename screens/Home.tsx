import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 28,
            fontWeight: '800',
            letterSpacing: 3,
          }}
        >
          STAYUNKNOWN
        </Text>

        <Text
          style={{
            color: '#aaa',
            fontSize: 15,
            marginTop: 12,
          }}
        >
          SHOP
        </Text>
      </View>
    </SafeAreaView>
  );
}