declare module '@react-native-community/slider' {
    import { Component } from 'react';
    import { ViewProps } from 'react-native';

    export interface SliderProps extends ViewProps {
        minimumValue?: number;
        maximumValue?: number;
        step?: number;
        value?: number;
        onValueChange?: (value: number) => void;
        onSlidingStart?: (value: number) => void;
        onSlidingComplete?: (value: number) => void;
        minimumTrackTintColor?: string;
        maximumTrackTintColor?: string;
        thumbTintColor?: string;
        disabled?: boolean;
    }

    export default class Slider extends Component<SliderProps> {}
}
