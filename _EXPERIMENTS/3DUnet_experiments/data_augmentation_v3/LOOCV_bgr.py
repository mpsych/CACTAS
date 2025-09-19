#!/usr/bin/env python3

import tensorflow as tf
import tensorflow.keras.backend as K
import numpy as np
import nrrd
import os
import ast
from sklearn.model_selection import train_test_split
import os
import json
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

    outputs = tf.keras.layers.Conv3D(1, 1, strides = 1)(decoder3)
    outputs = tf.keras.layers.Activation('sigmoid')(outputs)

    model = tf.keras.models.Model(inputs = inputs,  outputs = outputs,  name = 'Unet3D')

    return model

def compile_model():    

    model = unet_3D()
    print("compiling model")
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.0001)
    model.compile(optimizer=optimizer, loss='dice', metrics=[iou])#, metrics=[iou])
    return model
        

def iou(y_true, y_pred, smooth=0.000000001):
    # yt = K.argmax(y_true, axis=2)
    # yp = K.argmax(y_pred, axis=2)
    # print(y_pred)
    #yp = y_pred[0]
    # yp[yp>=0.5]=1
    # yp[yp<0.5]=0
    yp = y_pred
    yp = tf.where(yp >= 0.5, tf.ones_like(yp), yp)
    yp = tf.where(yp < 0.5, tf.zeros_like(yp), yp)
    yp = K.cast(yp, np.float32)

    yt = K.cast(y_true, np.float32)

    # print(yt.shape)
    # print(yp.shape)
    
    intersection = K.sum(yt * yp)
    union = K.sum(yt) + K.sum(yp)
    # intersection = K.sum(yt * yp, axis=1)
    # union = K.sum(yt, axis=1) + K.sum(yp, axis=1)
    return (intersection + smooth) / (union-intersection+smooth)


def load_data(left_out, trainlist_full):

    print("------------------- Loading Data -------------------")

    trainlist_leftout = []
    for patch in trainlist_full:
        
        if patch.split("_")[0] != str(left_out): 
            trainlist_leftout.append(patch)
    
    #print("loading inputs")
    
    number_inputs = len(trainlist_leftout)
    
    X, _ =  nrrd.read("inputs/" + trainlist_leftout[0])
    X = np.array([X]).astype(np.float32)
    X = np.expand_dims(X, -1)
    for i in range(1, number_inputs):
    
        try:
            volume, _ =  nrrd.read("inputs/" + trainlist_leftout[i])
            volume = np.array([volume])
            volume = np.expand_dims(volume, -1)
            X = np.concatenate((X, volume), axis=0)
        except:
            pass
            #print("skipping " + trainlist_leftout[i])
    
    print("loading ground truths")
    
    valid_samples = [trainlist_leftout[0]]
    
    y, _ =  nrrd.read("gt/" + trainlist_leftout[0])
    y = np.array([y])
    y = np.expand_dims(y, axis=-1)
    
    for i in range(1, number_inputs):
        try:
            volume, _ =  nrrd.read("gt/" + trainlist_leftout[i])
            volume = np.array([volume])
            volume = np.expand_dims(volume, axis=-1)
            y = np.concatenate((y, volume), axis=0)
            valid_samples.append(trainlist_leftout[i])
        except:
            pass
            #print("skipping " + trainlist_leftout[i])
    return X, y

# Checkpoint Saving
def train_model(model, X, y):
    checkpoint_path = "./checkpoints/cp-{epoch:04d}.weights.h5"
    cp_callback = tf.keras.callbacks.ModelCheckpoint(checkpoint_path, verbose=0,
                                                     save_weights_only=True, save_freq='epoch') #save_freq=1850)
    
    
    print("------------------- fitting model -------------------")
    model.fit(x=X, y=y,batch_size=2, epochs=200, callbacks = [cp_callback])

def compute_iou(y_true, y_pred, smooth=0.000000001):
    intersection = np.sum(y_true * y_pred)
    union = np.sum(y_true) + np.sum(y_pred)
    return (intersection + smooth) / (union-intersection+smooth)
    
def f1_sens_prec(y_true, y_pred, smooth=0.000000001):
    ones_matrix = np.ones(shape=(np.shape(y_true)))
    yp_negatives = ones_matrix - y_pred
    yt_negatives = ones_matrix - y_true
    
    tp = np.sum(y_true * y_pred)
    fp = np.count_nonzero((y_pred-y_true) == 1)
    tn = np.sum(yt_negatives * yp_negatives)
    fn = np.count_nonzero((yp_negatives-yt_negatives) == 1)

    fscore = (2 * tp) / (2*tp + fp + fn + smooth)
    sensitivity = tp / (tp + fn + smooth)
    precision = tp / (tp + fp + smooth)

    return fscore, sensitivity, precision


def test_model(number):

    print("------------------- Testing Model -------------------")
    with open("./test_data/patch_coords/"+str(number)+"_patch_coords.json", 'r') as f:
        p_coords = json.load(f)
    
    metrics = []
    
    gt, _ = nrrd.read("./test_data/reform/gt/"+str(number)+".nrrd")
    
    best_cp = 0
    best_iou = 0
    
    for cp in range(1, 201):
        cp_number = "{:04d}".format(cp)
        print(cp_number)
        model.load_weights("./checkpoints/cp-"+str(cp_number)+".weights.h5")
        
        reformation = np.zeros(shape=(p_coords[0]))
        
        for patch in range(1, len(p_coords)+1): 
            try:
                X, _ = nrrd.read("./inputs/"+str(number)+"_volume_"+str(p_coords[patch][0])+"_aug_0.nrrd")
                X = np.array([X]).astype(np.float32)
                X = np.expand_dims(X, -1)
                
                y = model.predict(X, verbose=0)
                y = y[0]
                y[y>=0.5]=1
                y[y<0.5]=0
                y = y[...,0]
                reformation[p_coords[patch][1]:p_coords[patch][2], p_coords[patch][3]:p_coords[patch][4], p_coords[patch][5]:p_coords[patch][6]] += y
            except:
                pass
                
        reformation[reformation > 1] = 1
        
        #nrrd.write("./test_data/reform/predictions/"+str(number)+"_checkpoint_"+str(cp_number)+".nrrd", reformation)
        iou = compute_iou(gt, reformation)
        f1, sens, prec = f1_sens_prec(gt, reformation)
        if iou > best_iou:
            best_iou = iou
            iou_other_metrics = [iou, f1, sens, prec]
            best_cp = cp
        #print("IOU: " + str(iou) + ", F1: "+ str(f1) + ", Sensitivity: " + str(sens) + ", Precision: " + str(prec))
        metrics.append([iou, f1, sens, prec])
    
    metrics_path = "./test_data/reform/metrics/"+str(number)+".csv"
    np.savetxt(metrics_path, np.array(metrics),  delimiter = ",")

seg_list = [91, 92, 95, 96, 97]


trainlist = os.listdir("./gt")
for left_out in seg_list:
    print(" ------------------- Leaving Out: " + str(left_out) + " -------------------")
    
    X,y = load_data(left_out, trainlist)
    
    model = compile_model()
    train_model(model, X, y)

    test_model(left_out)
    
    tf.keras.backend.clear_session(free_memory=True)
