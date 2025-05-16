import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import CustomTextInput from './src/components/CustomInput';
import CustomButton from './src/components/CustomButton';
import { useForm} from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const signInSchema = z.object({
  email: z.string({ message: 'Email is required' }).email('Invalid email'),
  password: z
    .string({ message: 'Password is required' })
    .min(8, 'Password should be at least 8 characters long'),
});

type SignInFields = z.infer<typeof signInSchema>;

export default function App() {
  const { control, handleSubmit } = useForm<SignInFields>({
    resolver: zodResolver(signInSchema),
  });

  const onSignIn = (data: SignInFields) => {
    // manual validation

    console.log('Sign in: ', data.email, data.password);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height' } style={styles.container}>
      <Text style={styles.title}>Sign in</Text>

      <View style={styles.form}>
        <CustomTextInput control={control} name="email" placeholder="Email" autoFocus autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <CustomTextInput control={control} name="password" placeholder="Password" secureTextEntry />
      </View>

       <CustomButton onPress={handleSubmit(onSignIn)} text="Sign in" />

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
    gap: 20,
  },
  form: {
    gap: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});
