import 'package:flutter/material.dart';
import 'package:frondend/view/screens/dashboard_pages/bottom.dart';
import 'package:frondend/view/screens/onboarding_pages/splash_screen.dart';
import 'package:frondend/view_model/provider.dart/bottom_bar.dart';
import 'package:frondend/view_model/provider.dart/field_provider.dart';
import 'package:frondend/view_model/provider.dart/quantity.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(MultiProvider(
    providers: [
      ChangeNotifierProvider(create: (_) => AnimationProvider()),
      ChangeNotifierProvider(create: (_) => BottomNavProvider()),
      ChangeNotifierProvider(create: (_) => FieldProvider()),
      ChangeNotifierProvider(create: (_) => ProductQuantity())
    ],
    child: AwafiMill(),
  ));
}

class AwafiMill extends StatelessWidget {
  const AwafiMill({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      theme: ThemeData(
          textTheme: TextTheme(
        bodyLarge: GoogleFonts.mulish(),
        bodySmall: GoogleFonts.mulish(),
        bodyMedium: GoogleFonts.mulish(),
      )),
      debugShowCheckedModeBanner: false,
      home: BottomScreen(),
    );
  }
}
