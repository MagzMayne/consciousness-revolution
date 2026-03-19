// RootIB: RB-20260319142113-36A28673
/**
 * ════════════════════════════════════════════════════════════════════════════════
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 * ════════════════════════════════════════════════════════════════════════════════
 * 
 * PROPRIETARY AND CONFIDENTIAL - INTELLECTUAL PROPERTY PROTECTION
 * 
 * This file contains proprietary intellectual property of Ryan Barbrick.
 * All concepts, algorithms, implementations, and innovations are protected by
 * copyright law and are considered trade secrets.
 * 
 * PROVISIONAL PATENT NOTICE:
 * The ideas, methods, systems, and code contained in this file are subject to
 * provisional patent protection. Unauthorized use, reproduction, modification,
 * or distribution is strictly prohibited.
 * 
 * LEGAL WARNING:
 * Unauthorized use of this intellectual property may result in:
 * - Civil litigation for copyright infringement
 * - Claims for actual and statutory damages ($750-$150,000 per work)
 * - Injunctive relief and cease & desist orders
 * - Criminal prosecution for willful infringement
 * - Recovery of attorney fees and legal costs
 * 
 * CREATOR INFORMATION:
 * Author: Ryan Barbrick
 * Business: Barbrick Design
 * Contact: BarbrickDesign@gmail.com
 * AI Assistant: Merlin AI
 * Repository: https://github.com/barbrickdesign/barbrickdesign.github.io
 * 
 * PATENT DECLARATION:
 * File: ultrasound-knowledge-base.js
 * Declaration ID: IP-5ADF9333-MLL28ZV7
 * Date: 2026-02-13
 * Innovation Type: Software Implementation, Algorithm, System Design
 * 
 * For licensing inquiries, contact: BarbrickDesign@gmail.com
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Ultrasound Knowledge Base
 * 
 * Educational reference information about ultrasound imaging
 * For personal learning and observation reference only
 * 
 * DISCLAIMER: This is educational information only, not medical advice.
 * Always consult qualified healthcare professionals for medical concerns.
 * 
 * © 2024-2025 Ryan Barbrick (Barbrick Design). All Rights Reserved.
 */

const UltrasoundKnowledgeBase = {
  
  /**
   * Common ultrasound artifacts and their characteristics
   * Understanding artifacts helps distinguish them from actual pathology
   */
  artifacts: {
    acoustic_shadow: {
      name: "Acoustic Shadow",
      description: "Dark area behind a highly reflective structure (like bone or calcification)",
      appearance: "Clean, dark shadow extending downward",
      significance: "Normal artifact, helps identify bone or calcified structures",
      commonLocations: ["Behind ribs", "Below gallstones", "Behind fetal skull"]
    },
    posterior_enhancement: {
      name: "Posterior Acoustic Enhancement",
      description: "Bright area behind fluid-filled structures",
      appearance: "Brighter echoes below cysts or fluid collections",
      significance: "Indicates fluid-filled structure (e.g., cyst, bladder)",
      commonLocations: ["Below cysts", "Below bladder", "Below fluid collections"]
    },
    reverberation: {
      name: "Reverberation Artifact",
      description: "Multiple parallel lines at regular intervals",
      appearance: "Repeating parallel bright lines",
      significance: "Common artifact from highly reflective surfaces",
      commonLocations: ["Near gas bubbles", "Metal implants", "Strong interfaces"]
    },
    comet_tail: {
      name: "Comet Tail Artifact",
      description: "Tapering line of echoes extending downward",
      appearance: "V-shaped bright streak",
      significance: "From small, highly reflective objects",
      commonLocations: ["Surgical clips", "Small calcifications"]
    },
    mirror_image: {
      name: "Mirror Image Artifact",
      description: "Structure appears on both sides of a reflective surface",
      appearance: "Duplicate image across diaphragm or other interface",
      significance: "Common artifact, not a real duplicate structure",
      commonLocations: ["Liver/diaphragm interface", "Bladder"]
    },
    side_lobe: {
      name: "Side Lobe Artifact",
      description: "Artifactual echoes from ultrasound beam spreading",
      appearance: "False echoes adjacent to real structures",
      significance: "Can create false appearance of echoes in fluid",
      commonLocations: ["Bladder", "Cysts", "Any fluid-filled structure"]
    }
  },

  /**
   * Common anatomical landmarks for orientation
   */
  anatomicalLandmarks: {
    abdomen: {
      liver: {
        location: "Right upper quadrant",
        echogenicity: "Homogeneous, medium echogenicity",
        landmarks: ["Portal vein", "Hepatic veins", "Diaphragm above"],
        normalAppearance: "Smooth texture, slightly brighter than kidney"
      },
      gallbladder: {
        location: "Right upper quadrant, below liver",
        echogenicity: "Anechoic (dark) when full of bile",
        landmarks: ["Liver above", "Portal vein nearby"],
        normalAppearance: "Teardrop or pear-shaped, thin walls"
      },
      kidney: {
        location: "Retroperitoneal, bilateral",
        echogenicity: "Less echogenic than liver",
        landmarks: ["Renal cortex", "Renal medulla (pyramids)", "Renal pelvis"],
        normalAppearance: "Bean-shaped, clear corticomedullary differentiation"
      },
      spleen: {
        location: "Left upper quadrant",
        echogenicity: "Similar to or slightly brighter than liver",
        landmarks: ["Diaphragm above", "Left kidney below"],
        normalAppearance: "Homogeneous, smooth contour"
      },
      pancreas: {
        location: "Retroperitoneal, mid-upper abdomen",
        echogenicity: "Similar to liver",
        landmarks: ["Splenic vein", "Aorta", "IVC"],
        normalAppearance: "Lobular appearance, may be obscured by gas"
      },
      aorta: {
        location: "Midline, retroperitoneal",
        echogenicity: "Anechoic lumen with echogenic walls",
        landmarks: ["Vertebral bodies posteriorly", "IVC to the right"],
        normalAppearance: "Pulsatile, <3cm diameter normally"
      }
    },
    pelvis: {
      bladder: {
        location: "Midline pelvis",
        echogenicity: "Anechoic when full",
        landmarks: ["Uterus behind in females", "Prostate behind in males"],
        normalAppearance: "Smooth walls, completely anechoic interior"
      },
      uterus: {
        location: "Midline pelvis, behind bladder",
        echogenicity: "Medium echogenicity",
        landmarks: ["Endometrial stripe (bright)", "Cervix inferiorly"],
        normalAppearance: "Pear-shaped, size varies with age/hormones"
      },
      ovaries: {
        location: "Lateral to uterus",
        echogenicity: "Medium echogenicity",
        landmarks: ["Follicles (anechoic)", "Iliac vessels laterally"],
        normalAppearance: "Oval, may contain follicles"
      }
    },
    superficial: {
      thyroid: {
        location: "Anterior neck",
        echogenicity: "Homogeneous, medium-high",
        landmarks: ["Carotid arteries laterally", "Trachea medially"],
        normalAppearance: "Butterfly shape, smooth texture"
      },
      breast: {
        location: "Anterior chest wall",
        echogenicity: "Variable, layered appearance",
        landmarks: ["Skin", "Subcutaneous fat", "Glandular tissue", "Pectoralis"],
        normalAppearance: "Layered architecture, ducts radiating from nipple"
      }
    }
  },

  /**
   * Probe types and their common applications
   */
  probeTypes: {
    convex: {
      name: "Convex (Curved Array)",
      frequency: "2-5 MHz",
      applications: [
        "Abdominal imaging",
        "Obstetric ultrasound",
        "Deep pelvic structures",
        "General body imaging"
      ],
      characteristics: "Wide field of view, good penetration, lower resolution",
      footprint: "Curved surface, 3-8 cm"
    },
    linear: {
      name: "Linear Array",
      frequency: "5-15 MHz",
      applications: [
        "Superficial structures",
        "Vascular imaging",
        "Musculoskeletal",
        "Thyroid, breast",
        "Nerve blocks"
      ],
      characteristics: "Rectangular field, high resolution, limited depth",
      footprint: "Straight surface, 4-5 cm"
    },
    phased: {
      name: "Phased Array (Sector)",
      frequency: "2-5 MHz",
      applications: [
        "Cardiac imaging",
        "Transcranial Doppler",
        "Imaging between ribs"
      ],
      characteristics: "Small footprint, sector field of view, good for tight spaces",
      footprint: "Small, 1-2 cm"
    },
    endocavitary: {
      name: "Endocavitary",
      frequency: "5-9 MHz",
      applications: [
        "Transvaginal imaging",
        "Transrectal imaging",
        "Early pregnancy",
        "Detailed pelvic assessment"
      ],
      characteristics: "High resolution, limited to specific applications",
      footprint: "Small, specialized"
    }
  },

  /**
   * Basic ultrasound terminology
   */
  terminology: {
    echogenicity: {
      term: "Echogenicity",
      definition: "The ability of tissue to reflect ultrasound waves",
      levels: {
        anechoic: "No echoes (appears black) - like fluid",
        hypoechoic: "Few echoes (appears dark gray) - less than surrounding tissue",
        isoechoic: "Same echoes as reference tissue (similar brightness)",
        hyperechoic: "Many echoes (appears bright white) - more than surrounding"
      }
    },
    doppler: {
      term: "Doppler",
      definition: "Technique to assess blood flow using frequency shifts",
      types: {
        color: "Shows direction and velocity of blood flow in color",
        power: "Shows presence of flow, more sensitive but no direction",
        spectral: "Shows velocity over time as a waveform"
      }
    },
    gain: {
      term: "Gain",
      definition: "Amplification of returning echoes",
      purpose: "Adjusts overall brightness without changing output power"
    },
    tgc: {
      term: "TGC (Time Gain Compensation)",
      definition: "Selective amplification at different depths",
      purpose: "Compensates for ultrasound attenuation with depth"
    },
    focus: {
      term: "Focal Zone",
      definition: "Depth where the ultrasound beam is most concentrated",
      purpose: "Best resolution at the focal point"
    },
    depth: {
      term: "Depth",
      definition: "How deep the ultrasound image shows",
      tradeoff: "Deeper imaging = lower frame rate"
    }
  },

  /**
   * Image optimization tips
   */
  optimizationTips: [
    {
      issue: "Image too dark",
      solutions: [
        "Increase overall gain",
        "Adjust TGC controls for specific depths",
        "Reduce depth setting if possible",
        "Check probe contact with skin"
      ]
    },
    {
      issue: "Image too bright",
      solutions: [
        "Decrease overall gain",
        "Reduce output power if available",
        "Check for excessive gel coupling"
      ]
    },
    {
      issue: "Poor resolution",
      solutions: [
        "Use highest frequency probe for depth needed",
        "Adjust focal zone to area of interest",
        "Optimize probe positioning",
        "Reduce depth if possible"
      ]
    },
    {
      issue: "Excessive shadowing",
      solutions: [
        "Change probe angle",
        "Try different acoustic window",
        "Ensure adequate gel coupling",
        "May indicate bone or calcification (normal)"
      ]
    },
    {
      issue: "Too much noise/speckle",
      solutions: [
        "Adjust gain settings",
        "Use speckle reduction if available",
        "Optimize probe pressure",
        "Check probe surface for damage"
      ]
    }
  ],

  /**
   * Safety information
   */
  safetyInfo: {
    bioeffects: {
      thermal: {
        description: "Tissue heating from absorbed ultrasound energy",
        safety: "Modern devices monitor thermal index (TI)",
        recommendation: "Keep exposure time as short as reasonably achievable (ALARA)"
      },
      mechanical: {
        description: "Effects from pressure waves (cavitation)",
        safety: "Modern devices monitor mechanical index (MI)",
        recommendation: "Higher MI for specific applications, minimize exposure"
      }
    },
    alara: {
      name: "ALARA Principle",
      fullName: "As Low As Reasonably Achievable",
      guidelines: [
        "Use lowest power necessary for diagnostic information",
        "Minimize scan time",
        "Avoid prolonged exposure to single area",
        "Higher caution in first trimester of pregnancy",
        "Document medical necessity"
      ]
    },
    contraindications: {
      absolute: [
        "None for diagnostic ultrasound"
      ],
      relative: [
        "Caution near pacemakers/implantable devices",
        "Avoid direct scanning of eyes",
        "Careful with recent surgical sites",
        "Caution with bleeding disorders for compression"
      ]
    }
  },

  /**
   * When to seek professional evaluation
   */
  seekProfessionalHelp: [
    {
      category: "Immediate (Emergency)",
      symptoms: [
        "Severe, sudden abdominal pain",
        "Heavy vaginal bleeding in pregnancy",
        "Chest pain with shortness of breath",
        "Signs of stroke (face droop, arm weakness, speech difficulty)",
        "Severe trauma",
        "Suspected ectopic pregnancy",
        "Testicular pain with swelling"
      ]
    },
    {
      category: "Urgent (Same Day)",
      symptoms: [
        "New or worsening pain",
        "Fever with pain or swelling",
        "Sudden swelling in abdomen or extremity",
        "Jaundice (yellow skin/eyes)",
        "Blood in urine",
        "Pregnancy with cramping or spotting"
      ]
    },
    {
      category: "Soon (Within Days)",
      symptoms: [
        "Persistent unexplained symptoms",
        "New mass or lump",
        "Changes in urination or bowel habits",
        "Unexplained weight loss",
        "Persistent pain",
        "Any concerns about findings"
      ]
    }
  ],

  /**
   * Limitations of home ultrasound
   */
  limitations: [
    "Cannot replace professional diagnostic imaging",
    "Limited by operator skill and experience",
    "Consumer devices have lower image quality than clinical systems",
    "Cannot visualize all structures adequately",
    "May miss significant pathology",
    "No Doppler capability on most consumer devices",
    "Cannot provide definitive diagnoses",
    "Image interpretation requires training",
    "Body habitus may limit image quality",
    "Gas and bone block ultrasound transmission"
  ],

  /**
   * Cancer Detection Reference Information
   * 
   * CRITICAL DISCLAIMER:
   * ====================
   * This information is for EDUCATIONAL purposes only.
   * Ultrasound findings are NEVER diagnostic of cancer alone.
   * ANY suspicious findings MUST be evaluated by qualified medical professionals.
   * Biopsy is the gold standard for cancer diagnosis.
   * Early detection saves lives - seek professional evaluation for any concerns.
   */
  cancerDetection: {
    /**
     * Testicular Cancer Detection
     */
    testicularCancer: {
      organName: "Testicles",
      prevalence: "Most common solid cancer in males age 15-35",
      survivalRate: ">95% if detected early",
      
      ultrasoundFindings: {
        typicalAppearance: [
          "Solid mass within testis",
          "Hypoechoic (darker) lesion",
          "Heterogeneous (mixed) echotexture",
          "May have cystic (fluid) areas",
          "Loss of normal testicular architecture",
          "Irregular borders"
        ],
        associatedFeatures: [
          "Testicular enlargement",
          "Asymmetry between testicles",
          "Microcalcifications (tiny bright spots)",
          "Increased vascularity (if Doppler available)",
          "Hydrocele (fluid around testis)",
          "Epididymal involvement"
        ],
        subtypes: {
          seminoma: {
            appearance: "Homogeneous hypoechoic mass",
            frequency: "40-50% of testicular cancers"
          },
          nonseminoma: {
            appearance: "Heterogeneous, may have hemorrhage/necrosis",
            frequency: "50-60% of testicular cancers"
          }
        }
      },
      
      warningSigns: [
        "Painless lump or swelling in testicle",
        "Testicular enlargement",
        "Heaviness in scrotum",
        "Dull ache in lower abdomen or groin",
        "Sudden fluid collection in scrotum",
        "Breast tenderness or growth (rare)",
        "Back pain (if metastasized)"
      ],
      
      riskFactors: [
        "Undescended testicle (cryptorchidism)",
        "Family history",
        "Previous testicular cancer",
        "Age 15-35 years",
        "Caucasian ethnicity",
        "HIV infection",
        "Klinefelter syndrome"
      ],
      
      screeningRecommendations: {
        selfExam: "Monthly self-examination recommended",
        clinicalExam: "Annual exam by healthcare provider",
        imaging: "Ultrasound for any palpable mass or asymmetry"
      },
      
      urgency: "HIGH - Any testicular mass requires prompt urological evaluation",
      
      diagnosticWorkup: [
        "Scrotal ultrasound (first-line imaging)",
        "Tumor markers (AFP, β-hCG, LDH)",
        "CT chest/abdomen/pelvis for staging",
        "Biopsy generally NOT done pre-operatively",
        "Radical orchiectomy for diagnosis and treatment"
      ]
    },

    /**
     * Ovarian Cancer Detection
     */
    ovarianCancer: {
      organName: "Ovaries",
      prevalence: "5th most common cancer in women, deadliest gynecologic cancer",
      survivalRate: "45% overall, >90% if Stage I, <30% if Stage IV",
      
      ultrasoundFindings: {
        typicalAppearance: [
          "Complex adnexal mass (mixed solid/cystic)",
          "Thick septations (walls) within cyst",
          "Solid components with irregular borders",
          "Papillary projections (bumps) into cyst",
          "Bilateral masses (both ovaries)",
          "Large size (>10cm concerning)"
        ],
        associatedFeatures: [
          "Ascites (fluid in abdomen)",
          "Omental thickening (abdominal lining)",
          "Peritoneal nodules",
          "Enlarged lymph nodes",
          "Loss of normal ovarian architecture",
          "Increased vascularity (if Doppler available)"
        ],
        benignVsMalignant: {
          benignFeatures: [
            "Thin-walled simple cyst",
            "Anechoic (completely dark) interior",
            "Smooth walls",
            "No solid components",
            "Posterior acoustic enhancement",
            "Size <5cm"
          ],
          malignantFeatures: [
            "Solid components",
            "Thick irregular walls or septations (>3mm)",
            "Papillary projections",
            "Heterogeneous appearance",
            "Bilateral involvement",
            "Ascites present"
          ]
        }
      },
      
      warningSigns: [
        "Abdominal bloating or swelling",
        "Pelvic or abdominal pain",
        "Feeling full quickly when eating",
        "Urinary symptoms (urgency, frequency)",
        "Fatigue",
        "Back pain",
        "Changes in bowel habits",
        "Weight loss or gain",
        "Abnormal vaginal bleeding"
      ],
      
      riskFactors: [
        "Age >50 years",
        "Family history (BRCA1/BRCA2 mutations)",
        "Personal history of breast cancer",
        "Never pregnant (nulliparity)",
        "Endometriosis",
        "Hormone replacement therapy",
        "Obesity",
        "Lynch syndrome"
      ],
      
      screeningRecommendations: {
        generalPopulation: "No routine screening recommended for average risk",
        highRisk: "Annual CA-125 and transvaginal ultrasound for BRCA carriers",
        symptoms: "Evaluate any persistent symptoms (>2 weeks)"
      },
      
      urgency: "HIGH - Complex adnexal mass with concerning features requires gynecologic oncology evaluation",
      
      diagnosticWorkup: [
        "Transvaginal ultrasound (best for ovarian imaging)",
        "CA-125 tumor marker (may be elevated)",
        "CT or MRI for staging",
        "Surgical exploration for diagnosis",
        "Pathology from biopsy/surgery confirms diagnosis"
      ]
    },

    /**
     * Breast Cancer Detection
     */
    breastCancer: {
      organName: "Breast",
      prevalence: "Most common cancer in women (1 in 8 lifetime risk)",
      survivalRate: "99% if localized, 86% regional, 31% distant",
      
      ultrasoundFindings: {
        typicalAppearance: [
          "Solid hypoechoic (dark) mass",
          "Irregular or spiculated (star-shaped) borders",
          "Taller-than-wide orientation (vertical)",
          "Posterior acoustic shadowing",
          "Heterogeneous internal echoes",
          "Microlobulated or angular margins"
        ],
        associatedFeatures: [
          "Skin thickening",
          "Nipple retraction",
          "Architectural distortion",
          "Calcifications (may not be visible on ultrasound)",
          "Axillary lymph node enlargement",
          "Increased vascularity (if Doppler available)"
        ],
        benignVsMalignant: {
          benignFeatures: [
            "Oval or round shape",
            "Well-defined smooth margins",
            "Wider-than-tall orientation (horizontal)",
            "Posterior acoustic enhancement",
            "Thin echogenic capsule",
            "Uniform hypoechoic appearance"
          ],
          malignantFeatures: [
            "Irregular or spiculated margins",
            "Taller-than-wide shape",
            "Posterior acoustic shadowing",
            "Microlobulations",
            "Angular margins",
            "Branch pattern"
          ]
        },
        subtypes: {
          invasiveDuctal: {
            appearance: "Most common, irregular hypoechoic mass with shadowing",
            frequency: "70-80% of breast cancers"
          },
          invasiveLobular: {
            appearance: "May be subtle, posterior shadowing, distortion",
            frequency: "10-15% of breast cancers"
          },
          ductalCarcinomaInSitu: {
            appearance: "May not be visible on ultrasound, calcifications on mammography",
            frequency: "20% of detected breast cancers"
          }
        }
      },
      
      warningSigns: [
        "New lump or mass in breast or armpit",
        "Change in size or shape of breast",
        "Skin dimpling or puckering",
        "Nipple retraction or inversion",
        "Nipple discharge (especially bloody)",
        "Skin redness or scaling",
        "Pain in breast or nipple",
        "Breast swelling (even without lump)",
        "Thickened area in breast"
      ],
      
      riskFactors: [
        "Female gender (99% of breast cancers)",
        "Increasing age (most common >50)",
        "Family history (BRCA1/BRCA2 mutations)",
        "Personal history of breast cancer",
        "Dense breast tissue",
        "Early menstruation (<12 years)",
        "Late menopause (>55 years)",
        "No children or first child after 30",
        "Hormone therapy",
        "Alcohol consumption",
        "Obesity",
        "Radiation exposure"
      ],
      
      screeningRecommendations: {
        averageRisk: "Mammography annually starting age 40-45",
        highRisk: "Annual mammography and MRI starting age 30",
        clinicalExam: "Every 1-3 years ages 25-39, annually age 40+",
        selfExam: "Monthly breast self-examination recommended"
      },
      
      urgency: "HIGH - Any suspicious breast mass requires breast imaging (mammography/ultrasound) and possible biopsy",
      
      diagnosticWorkup: [
        "Diagnostic mammography (2D or 3D)",
        "Breast ultrasound (for palpable lumps)",
        "Breast MRI (high-risk patients or staging)",
        "Core needle biopsy (gold standard for diagnosis)",
        "Sentinel lymph node biopsy if cancer confirmed",
        "Genetic testing if indicated"
      ]
    },

    /**
     * General suspicious features across all cancer types
     */
    generalSuspiciousFeatures: [
      "Solid mass (not fluid-filled)",
      "Irregular or ill-defined borders",
      "Heterogeneous (mixed) appearance",
      "Loss of normal tissue architecture",
      "Asymmetry compared to other side",
      "Rapid growth",
      "Fixed or immobile mass",
      "Associated lymph node enlargement",
      "Vascular changes (if Doppler available)"
    ],

    /**
     * Important reminders for users
     */
    criticalReminders: [
      "🚨 ULTRASOUND ALONE CANNOT DIAGNOSE CANCER",
      "🔬 Biopsy is required for definitive cancer diagnosis",
      "⏰ Early detection significantly improves outcomes",
      "👨‍⚕️ ANY suspicious finding requires professional evaluation",
      "🏥 Do not delay seeking medical attention for concerning symptoms",
      "📊 Regular screening saves lives for breast cancer",
      "🧬 Genetic testing may be appropriate for high-risk individuals",
      "💊 Treatment options are most effective when cancer is caught early"
    ]
  },

  /**
   * Get information about a specific artifact
   */
  getArtifactInfo(artifactType) {
    return this.artifacts[artifactType] || null;
  },

  /**
   * Get anatomical landmark information
   */
  getAnatomyInfo(region, structure) {
    if (this.anatomicalLandmarks[region]) {
      return this.anatomicalLandmarks[region][structure] || null;
    }
    return null;
  },

  /**
   * Get probe information
   */
  getProbeInfo(probeType) {
    return this.probeTypes[probeType] || null;
  },

  /**
   * Get optimization tips for a specific issue
   */
  getOptimizationTips(issue) {
    return this.optimizationTips.find(tip => 
      tip.issue.toLowerCase().includes(issue.toLowerCase())
    );
  },

  /**
   * Get cancer detection information for a specific cancer type
   */
  getCancerInfo(cancerType) {
    const typeMap = {
      'testicular': 'testicularCancer',
      'testicle': 'testicularCancer',
      'testis': 'testicularCancer',
      'ovarian': 'ovarianCancer',
      'ovary': 'ovarianCancer',
      'breast': 'breastCancer',
      'mammary': 'breastCancer'
    };
    
    const key = typeMap[cancerType.toLowerCase()];
    return key ? this.cancerDetection[key] : null;
  },

  /**
   * Get suspicious features for analysis
   */
  getSuspiciousFeatures() {
    return this.cancerDetection.generalSuspiciousFeatures;
  },

  /**
   * Get critical cancer detection reminders
   */
  getCancerReminders() {
    return this.cancerDetection.criticalReminders;
  },

  /**
   * Analyze features against cancer patterns
   * Returns risk assessment and recommendations
   */
  analyzeCancerRisk(organType, detectedFeatures) {
    const cancerInfo = this.getCancerInfo(organType);
    if (!cancerInfo) {
      return {
        error: 'Unknown organ type',
        recommendation: 'Consult medical professional for any concerns'
      };
    }

    let suspiciousCount = 0;
    const matchedFeatures = [];
    const allSuspiciousFeatures = [
      ...cancerInfo.ultrasoundFindings.typicalAppearance,
      ...cancerInfo.ultrasoundFindings.associatedFeatures,
      ...(cancerInfo.ultrasoundFindings.benignVsMalignant?.malignantFeatures || []),
      ...this.cancerDetection.generalSuspiciousFeatures
    ];

    // Check detected features against known suspicious patterns
    detectedFeatures.forEach(feature => {
      const featureDesc = feature.description?.toLowerCase() || feature.toLowerCase();
      allSuspiciousFeatures.forEach(suspicious => {
        if (featureDesc.includes(suspicious.toLowerCase()) ||
            suspicious.toLowerCase().includes(featureDesc)) {
          suspiciousCount++;
          matchedFeatures.push({
            detected: feature.description || feature,
            matches: suspicious
          });
        }
      });
    });

    // Risk assessment
    let riskLevel = 'low';
    let urgency = 'routine';
    
    if (suspiciousCount >= 3) {
      riskLevel = 'high';
      urgency = 'urgent';
    } else if (suspiciousCount >= 1) {
      riskLevel = 'moderate';
      urgency = 'prompt';
    }

    return {
      organType: cancerInfo.organName,
      cancerType: organType,
      riskLevel: riskLevel,
      suspiciousFeatureCount: suspiciousCount,
      matchedFeatures: matchedFeatures,
      urgency: urgency,
      warningSigns: cancerInfo.warningSigns,
      recommendation: this.getCancerRecommendation(riskLevel, cancerInfo),
      disclaimer: '⚠️ This is NOT a medical diagnosis. Only a healthcare professional can diagnose cancer.'
    };
  },

  /**
   * Get recommendation based on risk level
   */
  getCancerRecommendation(riskLevel, cancerInfo) {
    if (riskLevel === 'high') {
      return `🚨 URGENT: ${cancerInfo.urgency}. Schedule professional evaluation immediately. Multiple suspicious features detected that warrant prompt medical imaging and possible biopsy.`;
    } else if (riskLevel === 'moderate') {
      return `⚠️ IMPORTANT: Schedule medical evaluation soon. Some concerning features detected. Professional imaging recommended. ${cancerInfo.diagnosticWorkup[0]} is typically the first step.`;
    } else {
      return `ℹ️ Routine monitoring recommended. If you experience any symptoms, particularly ${cancerInfo.warningSigns[0].toLowerCase()}, schedule a medical evaluation. Regular screening is important.`;
    }
  },

  /**
   * Search knowledge base
   */
  search(query) {
    const results = [];
    const searchTerm = query.toLowerCase();
    
    // Search artifacts
    Object.entries(this.artifacts).forEach(([key, artifact]) => {
      if (artifact.name.toLowerCase().includes(searchTerm) ||
          artifact.description.toLowerCase().includes(searchTerm)) {
        results.push({
          category: 'Artifact',
          type: key,
          data: artifact
        });
      }
    });
    
    // Search anatomy
    Object.entries(this.anatomicalLandmarks).forEach(([region, structures]) => {
      Object.entries(structures).forEach(([structure, data]) => {
        if (structure.toLowerCase().includes(searchTerm) ||
            data.location.toLowerCase().includes(searchTerm)) {
          results.push({
            category: 'Anatomy',
            region: region,
            structure: structure,
            data: data
          });
        }
      });
    });
    
    // Search terminology
    Object.entries(this.terminology).forEach(([key, term]) => {
      if (term.term.toLowerCase().includes(searchTerm) ||
          term.definition.toLowerCase().includes(searchTerm)) {
        results.push({
          category: 'Terminology',
          type: key,
          data: term
        });
      }
    });
    
    return results;
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.UltrasoundKnowledgeBase = UltrasoundKnowledgeBase;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UltrasoundKnowledgeBase;
}
