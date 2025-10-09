import React from 'react';
import { Animated, Easing } from 'react-native';

// Animation utility functions
export class AnimationUtils {
    // Fade animations
    static fadeIn = (value: Animated.Value, duration: number = 300) => {
        return Animated.timing(value, {
            toValue: 1,
            duration,
            useNativeDriver: true,
        });
    };

    static fadeOut = (value: Animated.Value, duration: number = 300) => {
        return Animated.timing(value, {
            toValue: 0,
            duration,
            useNativeDriver: true,
        });
    };

    // Scale animations
    static scaleIn = (value: Animated.Value, duration: number = 300) => {
        return Animated.timing(value, {
            toValue: 1,
            duration,
            easing: Easing.out(Easing.back(1.2)),
            useNativeDriver: true,
        });
    };

    static scaleOut = (value: Animated.Value, duration: number = 300) => {
        return Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.in(Easing.back(1.2)),
            useNativeDriver: true,
        });
    };

    // Slide animations
    static slideInFromRight = (value: Animated.Value, duration: number = 300) => {
        return Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        });
    };

    static slideInFromLeft = (value: Animated.Value, duration: number = 300) => {
        return Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        });
    };

    static slideInFromBottom = (value: Animated.Value, duration: number = 300) => {
        return Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        });
    };

    static slideInFromTop = (value: Animated.Value, duration: number = 300) => {
        return Animated.timing(value, {
            toValue: 0,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        });
    };

    // Rotation animations
    static rotate = (value: Animated.Value, duration: number = 1000) => {
        return Animated.loop(
            Animated.timing(value, {
                toValue: 1,
                duration,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
    };

    // Pulse animation
    static pulse = (value: Animated.Value, duration: number = 1000) => {
        return Animated.loop(
            Animated.sequence([
                Animated.timing(value, {
                    toValue: 1.1,
                    duration: duration / 2,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(value, {
                    toValue: 1,
                    duration: duration / 2,
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                }),
            ])
        );
    };

    // Bounce animation
    static bounce = (value: Animated.Value, duration: number = 600) => {
        return Animated.sequence([
            Animated.timing(value, {
                toValue: 1.2,
                duration: duration * 0.3,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(value, {
                toValue: 0.9,
                duration: duration * 0.2,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(value, {
                toValue: 1.05,
                duration: duration * 0.2,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(value, {
                toValue: 1,
                duration: duration * 0.3,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
            }),
        ]);
    };

    // Shake animation
    static shake = (value: Animated.Value, duration: number = 500) => {
        return Animated.sequence([
            Animated.timing(value, {
                toValue: 10,
                duration: duration * 0.1,
                useNativeDriver: true,
            }),
            Animated.timing(value, {
                toValue: -10,
                duration: duration * 0.1,
                useNativeDriver: true,
            }),
            Animated.timing(value, {
                toValue: 10,
                duration: duration * 0.1,
                useNativeDriver: true,
            }),
            Animated.timing(value, {
                toValue: -10,
                duration: duration * 0.1,
                useNativeDriver: true,
            }),
            Animated.timing(value, {
                toValue: 10,
                duration: duration * 0.1,
                useNativeDriver: true,
            }),
            Animated.timing(value, {
                toValue: 0,
                duration: duration * 0.1,
                useNativeDriver: true,
            }),
        ]);
    };

    // Wiggle animation
    static wiggle = (value: Animated.Value, duration: number = 300) => {
        return Animated.sequence([
            Animated.timing(value, {
                toValue: 15,
                duration: duration * 0.25,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(value, {
                toValue: -15,
                duration: duration * 0.25,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(value, {
                toValue: 10,
                duration: duration * 0.25,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(value, {
                toValue: 0,
                duration: duration * 0.25,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
            }),
        ]);
    };

    // Stagger animations
    static stagger = (animations: Animated.CompositeAnimation[], delay: number = 100) => {
        return Animated.stagger(delay, animations);
    };

    // Parallel animations
    static parallel = (animations: Animated.CompositeAnimation[]) => {
        return Animated.parallel(animations);
    };

    // Sequence animations
    static sequence = (animations: Animated.CompositeAnimation[]) => {
        return Animated.sequence(animations);
    };

    // Spring animations
    static spring = (value: Animated.Value, toValue: number, config?: any) => {
        return Animated.spring(value, {
            toValue,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
            ...config,
        });
    };

    // Decay animations
    static decay = (value: Animated.Value, velocity: number, deceleration: number = 0.997) => {
        return Animated.decay(value, {
            velocity,
            deceleration,
            useNativeDriver: true,
        });
    };
}

// Predefined animation configurations
export const ANIMATION_CONFIGS = {
    // Quick animations
    quick: {
        duration: 150,
        easing: Easing.out(Easing.quad),
    },

    // Normal animations
    normal: {
        duration: 300,
        easing: Easing.out(Easing.cubic),
    },

    // Slow animations
    slow: {
        duration: 500,
        easing: Easing.out(Easing.cubic),
    },

    // Bouncy animations
    bouncy: {
        duration: 400,
        easing: Easing.out(Easing.back(1.2)),
    },

    // Elastic animations
    elastic: {
        duration: 600,
        easing: Easing.out(Easing.elastic(1)),
    },
};

// Common animation presets
export const ANIMATION_PRESETS = {
    // Button press animation
    buttonPress: {
        scale: 0.95,
        duration: 100,
    },

    // Card hover animation
    cardHover: {
        scale: 1.02,
        duration: 200,
    },

    // Modal entrance
    modalEntrance: {
        scale: 1,
        opacity: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.2)),
    },

    // List item entrance
    listItemEntrance: {
        opacity: 1,
        translateY: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
    },

    // Loading spinner
    loadingSpinner: {
        duration: 1000,
        easing: Easing.linear,
    },
};

// Animation hooks for common use cases
export const useAnimationHooks = () => {
    // Fade in on mount
    const fadeInOnMount = (duration: number = 300) => {
        const opacity = new Animated.Value(0);

        React.useEffect(() => {
            AnimationUtils.fadeIn(opacity, duration).start();
        }, []);

        return opacity;
    };

    // Scale in on mount
    const scaleInOnMount = (duration: number = 300) => {
        const scale = new Animated.Value(0);

        React.useEffect(() => {
            AnimationUtils.scaleIn(scale, duration).start();
        }, []);

        return scale;
    };

    // Slide in from bottom on mount
    const slideInFromBottomOnMount = (duration: number = 300) => {
        const translateY = new Animated.Value(50);

        React.useEffect(() => {
            AnimationUtils.slideInFromBottom(translateY, duration).start();
        }, []);

        return translateY;
    };

    return {
        fadeInOnMount,
        scaleInOnMount,
        slideInFromBottomOnMount,
    };
};

export default AnimationUtils;
