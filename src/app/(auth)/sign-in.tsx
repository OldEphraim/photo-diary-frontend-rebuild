import {
    StyleSheet,
    Text,
    KeyboardAvoidingView,
    Platform,
    View,
    ScrollView,
    SafeAreaView,
  } from 'react-native';
  import CustomInput from '@/components/CustomInput';
  import CustomButton from '@/components/CustomButton';
  import { Link } from 'expo-router';
  import { useForm } from 'react-hook-form';
  import { z } from 'zod';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { isClerkAPIResponseError, useSignIn } from '@clerk/clerk-expo';
  import SignInWith from '@/components/SignInWith';
  
  const signInSchema = z.object({
    email: z.string({ message: 'Email is required' }).email('Invalid email'),
    password: z
      .string({ message: 'Password is required' })
      .min(8, 'Password should be at least 8 characters long'),
  });
  
  type SignInFields = z.infer<typeof signInSchema>;
  
  const mapClerkErrorToFormField = (error: any) => {
    switch (error.meta?.paramName) {
      case 'identifier':
        return 'email';
      case 'password':
        return 'password';
      default:
        return 'root';
    }
  };
  
  export default function SignInScreen() {
    const { control, handleSubmit, setError, formState: { errors } } = useForm<SignInFields>({
      resolver: zodResolver(signInSchema),
    });
  
    console.log('Errors: ', JSON.stringify(errors, null, 2));
  
    const { signIn, isLoaded, setActive } = useSignIn();
  
    const onSignIn = async (data: SignInFields) => {
      if (!isLoaded) return;
  
      try {
        const signInAttempt = await signIn.create({
          identifier: data.email,
          password: data.password,
        });
  
        if (signInAttempt.status === 'complete') {
          setActive({ session: signInAttempt.createdSessionId });
        } else {
          console.log('Sign in failed');
          setError('root', { message: 'Sign in could not be completed' });
        }
  
        console.log('Sign in attempt: ', signInAttempt);
      } catch (err) {
        console.log('Sign in error: ', JSON.stringify(err, null, 2));
  
        if (isClerkAPIResponseError(err)) {
          err.errors.forEach((error) => {
            const fieldName = mapClerkErrorToFormField(error);
            setError(fieldName, {
              message: error.longMessage,
            });
          });
        } else {
          setError('root', { message: 'Unknown error' });
        }
      }
  
      console.log('Sign in: ', data.email, data.password);
    };
  
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Welcome Back</Text>
  
            <View style={styles.form}>
              <CustomInput
                control={control}
                name='email'
                placeholder='Email'
                autoCapitalize='none'
                keyboardType='email-address'
                autoComplete='email'
              />
  
              <CustomInput
                control={control}
                name='password'
                placeholder='Password'
                secureTextEntry
              />
              
              {errors.root && (
                <Text style={styles.errorText}>{errors.root.message}</Text>
              )}
            </View>
  
            <CustomButton text='Sign in' onPress={handleSubmit(onSignIn)} />
  
            <Link href='/sign-up' style={styles.link}>
              Don't have an account? Sign up
            </Link>
  
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>
  
            <SignInWith />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#fff',
    },
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
      gap: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      marginBottom: 10,
    },
    form: {
      gap: 10,
    },
    errorText: {
      color: 'crimson',
      marginTop: 6,
    },
    link: {
      color: '#4353FD',
      fontWeight: '600',
      alignSelf: 'center',
      marginTop: 5,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 15,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: '#e0e0e0',
    },
    dividerText: {
      paddingHorizontal: 12,
      color: '#999',
      fontSize: 14,
    },
  });