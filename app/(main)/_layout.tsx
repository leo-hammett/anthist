import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function MainLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
        },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="settings" 
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="content-list" 
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="add-content" 
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="processing" 
        options={{
          presentation: 'fullScreenModal',
          animation: 'fade',
        }}
      />
    </Stack>
  );
}
