import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

export function PetifySpinner({ size = 64 }: { size?: number }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.Image
      source={require("../../assets/images/petify_loading_NotBackground.png")}
      style={{ width: size, height: size, transform: [{ rotate }] }}
      resizeMode="contain"
    />
  );
}
