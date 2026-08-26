import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Colors, Font, Radius, Spacing } from '../lib/theme';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CRMAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  onClose: () => void;
}

export function CRMAlert({ visible, title, message, buttons, onClose }: CRMAlertProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>

          {message ? (
            <Text style={styles.message}>{message}</Text>
          ) : null}

          <View style={styles.buttonRow}>
            {buttons.map((btn, index) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    isDestructive && styles.buttonDestructive,
                    isCancel && styles.buttonCancel,
                    buttons.length === 1 && styles.buttonFull,
                  ]}
                  onPress={() => {
                    btn.onPress?.();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isDestructive && styles.buttonTextDestructive,
                      isCancel && styles.buttonTextCancel,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Utility hook for simple alerts
interface UseCRMAlertReturn {
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
  AlertModal: React.FC;
}

export function useCRMAlert(): UseCRMAlertReturn {
  const [state, setState] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [{ text: 'OK' }],
  });

  const showAlert = React.useCallback(
    (title: string, message?: string, buttons?: AlertButton[]) => {
      setState({
        visible: true,
        title,
        message: message || '',
        buttons: buttons || [{ text: 'OK' }],
      });
    },
    []
  );

  const onClose = React.useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const AlertModal = React.useCallback(
    () => (
      <CRMAlert
        visible={state.visible}
        title={state.title}
        message={state.message}
        buttons={state.buttons}
        onClose={onClose}
      />
    ),
    [state, onClose]
  );

  return { showAlert, AlertModal };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  container: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border.default,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: Font.size.h3,
    fontWeight: Font.weight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  message: {
    fontSize: Font.size.bodyMd,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: Colors.border.subtle,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonFull: {
    flex: 1,
  },
  buttonCancel: {
    borderRightWidth: 0.5,
    borderRightColor: Colors.border.subtle,
  },
  buttonDestructive: {},
  buttonText: {
    fontSize: Font.size.bodyMd,
    fontWeight: Font.weight.semibold,
    color: Colors.primary[500],
  },
  buttonTextCancel: {
    color: Colors.text.secondary,
  },
  buttonTextDestructive: {
    color: Colors.status.error,
  },
});
