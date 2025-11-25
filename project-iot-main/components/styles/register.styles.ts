import { StyleSheet, Dimensions, Platform } from 'react-native';

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#7C3AED',
  },

  gradient: {
    flex: 1,
  },

  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 10 : 60,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },

  circleContainer: {
    ...StyleSheet.absoluteFillObject,
  },

  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -100,
    right: -100,
  },

  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    bottom: 100,
    left: -50,
  },

  circle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: height / 2,
    right: 20,
  },

  keyboardContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },

  header: {
    alignItems: 'center',
    marginBottom: 40,
  },

  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },

  formContainer: {
    width: '100%',
    marginBottom: 24,
  },

  inputWrapper: {
    marginBottom: 20,
    width: '100%',
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    marginLeft: 4,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    height: 56,
  },

  inputIcon: {
    marginRight: 12,
  },

  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },

  passwordHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: -12,
    marginLeft: 4,
  },

  registerButton: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },

  registerButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
    elevation: 3,
  },

  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 12,
  },

  registerTextButton: {
    fontSize: 17,
    fontWeight: '700',
    color: '#7C3AED',
  },

  registerTextDisabled: {
    color: '#A78BFA',
  },

  signInContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },

  signInText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  signInLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },

  termsText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 16,
  },

  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});