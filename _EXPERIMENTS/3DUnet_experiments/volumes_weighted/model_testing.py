import tensorflow as tf
import tensorflow.keras.backend as K
import numpy as np
import nrrd
print("------------------------------------------------------------------------------------------------")
print(tf.__version__)
print(tf.config.list_physical_devices('GPU'))
print("------------------------------------------------------------------------------------------------")

def encoder_block(inputs, output_channels, lastlayer=False):
    """
    Two 3x3x3 convolutions with batch normalization and ReLU activation
    2x2x2 max pool
    """

    # 3x3x3 convolutions with ReLU activation
    x = tf.keras.layers.Conv3D(int(output_channels/2), kernel_size=3, strides=1, padding='same')(inputs)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.ReLU()(x)
    x = tf.keras.layers.Conv3D(output_channels, kernel_size=3, strides=1, padding='same')(x)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.ReLU()(x)

    # 2x2x2 max pool
    
    if not lastlayer:
        x_maxPool = tf.keras.layers.MaxPool3D(pool_size=2, strides=2, padding = 'same')(x)
    else:
        x_maxPool = x

    return x, x_maxPool

def decoder_block(inputs, skip_features, output_channels): 

	# Upsampling with 2x2x2 filter 
	x = tf.keras.layers.Conv3DTranspose(output_channels*2, kernel_size=2, strides=2, padding = 'same')(inputs)
	
    # Concatenate the skip features
	x = tf.keras.layers.Concatenate()([x, skip_features]) 
	
	# 2 convolutions with 3x3 filter, batch normalization, ReLU activation 
	x = tf.keras.layers.Conv3D(output_channels, kernel_size=3, strides=1, padding = 'same')(x) 
	x = tf.keras.layers.BatchNormalization()(x)
	x = tf.keras.layers.ReLU()(x)

	x = tf.keras.layers.Conv3D(output_channels, kernel_size=3, strides=1, padding = 'same')(x) 
	x = tf.keras.layers.BatchNormalization()(x)
	x = tf.keras.layers.ReLU()(x)
	
	return x

def unet_3D():
    inputs = tf.keras.Input(shape=(64, 64, 64, 1,))

    e1_skip, e1_maxpool = encoder_block(inputs, 64)
    e2_skip, e2_maxpool = encoder_block(e1_maxpool, 128)
    e3_skip, e3_maxpool = encoder_block(e2_maxpool, 256)
    _, e4 = encoder_block(e3_maxpool, 512, True)

    decoder1 = decoder_block(e4, e3_skip, 256)
    decoder2 = decoder_block(decoder1, e2_skip, 128)
    decoder3 = decoder_block(decoder2, e1_skip, 64)

    outputs = tf.keras.layers.Conv3D(2, 1, strides = 1)(decoder3)
    outputs = tf.keras.layers.Reshape((64*64*64, 2))(outputs)
    #outputs = tf.keras.layers.Activation('softmax')(outputs)

    model = tf.keras.models.Model(inputs = inputs,  outputs = outputs,  name = 'Unet3D')
    
    return model

def unet_3D_shallow():
    inputs = tf.keras.Input(shape=(112,112,96,1,)) # need to figure out how to standardize z axis

    e1_skip, e1_maxpool = encoder_block(inputs, 64)
    _, e2 = encoder_block(e1_maxpool, 128, True)
    
    decoder1 = decoder_block(e2, e1_skip, 64)

    outputs = tf.keras.layers.Conv3D(2, 1, strides = 1)(decoder1)

    model = tf.keras.models.Model(inputs = inputs,  outputs = outputs,  name = 'Unet3D_shallow')

    return model    

def dice(y_true, y_pred, smooth=1):
    yp = K.argmax(y_pred, axis=2)
    yt = K.argmax(y_true, axis=2)
    
    intersection = K.sum(yt * yp, axis=1)
    union = K.sum(yt, axis=1) + K.sum(yp, axis=1)
    return 2*(intersection + smooth) / (union+smooth)

def iou(y_true, y_pred, smooth=1):
    yt = K.argmax(y_true, axis=2)
    yp = K.argmax(y_pred, axis=2)

    intersection = K.sum(yt * yp, axis=1)
    union = K.sum(yt, axis=1) + K.sum(yp, axis=1)
    return (intersection + smooth) / (union-intersection+smooth)

print("-------------------------- building model ------------------------")
model = unet_3D()
# model.summary()

model.load_weights("./checkpoints/cp-0130.weights.h5")

#X, _ = nrrd.read("./test_volumes/11_volume_11.full.nrrd")
X, _ = nrrd.read("./inputs/2_volume_5.nrrd")
X = np.array([X]).astype(np.float32)
X = np.expand_dims(X, -1)

y = model.predict(X)
y = y[0]
#print(y[0])
y = np.argmax(y, axis=1)
print(y.shape)
print(np.unique(y))

output = np.reshape(y, (64, 64, 64)).astype(np.uint8)
print(output.shape)
print(type(output[0,0,0]))
#nrrd.write("./test_results/11_v11.nrrd", output)
nrrd.write("./test_results/2_v5.nrrd", output)
