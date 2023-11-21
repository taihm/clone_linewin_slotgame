import { _decorator, AudioClip, AudioSource, director, Node, resources } from 'cc';
const { ccclass } = _decorator;

@ccclass('AudioMgr')
export class AudioMgr {
    private static _inst: AudioMgr;
    public static get inst(): AudioMgr {
        if (this._inst == null) {
            this._inst = new AudioMgr();
        }
        return this._inst;
    }

    private _audioSource: AudioSource;
    constructor() {
        //@en create a node as audioMgr
        let audioMgr = new Node();
        audioMgr.name = '__audioMgr__';

        //@en add to the scene.
        director.getScene().addChild(audioMgr);

        //@en make it as a persistent node, so it won't be destroied when scene change.
        director.addPersistRootNode(audioMgr);

        //@en add AudioSource componrnt to play audios.
        this._audioSource = audioMgr.addComponent(AudioSource);
    }

    public get audioSource() {
        return this._audioSource;
    }

    /**
     * @en
     * play short audio, such as strikes,explosions
     * @param sound clip or url for the audio
     * @param volume 
     */
    playOneShot(sound: AudioClip | string, volume: number = 1.0) {
        if (sound instanceof AudioClip) {
            this._audioSource.playOneShot(sound, volume);
        }
        else {
            resources.load(sound, (err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this._audioSource.playOneShot(clip, volume);
                }
            });
        }
    }

    /**
     * @en
     * play long audio, such as the bg music
     * @param sound clip or url for the sound
     * @param volume 
     */
    play(sound: AudioClip | string, volume: number = 1.0) {
        if (sound instanceof AudioClip) {
            this._audioSource.clip = sound;
            this._audioSource.play();
            this.audioSource.volume = volume;
        }
        else {
            resources.load(sound, (err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this._audioSource.clip = clip;
                    this._audioSource.play();
                    this.audioSource.volume = volume;
                }
            });
        }
    }

    /**
     * stop the audio play
     */
    stop() {
        this._audioSource.stop();
    }

    /**
     * pause the audio play
     */
    pause() {
        this._audioSource.pause();
    }

    /**
     * resume the audio play
     */
    resume(){
        this._audioSource.play();
    }
}

